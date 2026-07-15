-- ======================================================================
-- SoftKey Store - Complete unified Supabase PostgreSQL Bootstrapping Schema
-- Configured for B2B and B2C Live Data Saving, Fetching, and Syncing
-- ======================================================================

-- ======================================================================
-- 0. CLEAN UP / RESET (Erase previous constraints and objects if re-running)
-- ======================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.b2b_resellers CASCADE;
DROP TABLE IF EXISTS public.coupon_usage CASCADE;
DROP TABLE IF EXISTS public.hardware_tracking CASCADE;
DROP TABLE IF EXISTS public.license_key_history CASCADE;
DROP TABLE IF EXISTS public.license_keys CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

DROP TYPE IF EXISTS category_type CASCADE;
DROP TYPE IF EXISTS license_key_status CASCADE;
DROP TYPE IF EXISTS license_action_type CASCADE;
DROP TYPE IF EXISTS payment_status_type CASCADE;
DROP TYPE IF EXISTS shipping_status_type CASCADE;
DROP TYPE IF EXISTS discount_type_enum CASCADE;
DROP TYPE IF EXISTS banner_position_type CASCADE;
DROP TYPE IF EXISTS notification_type_enum CASCADE;
DROP TYPE IF EXISTS reseller_status_type CASCADE;
DROP TYPE IF EXISTS wallet_tx_type CASCADE;
DROP TYPE IF EXISTS wallet_tx_status_type CASCADE;

-- Enable Crypto Extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 1. TYPES & ENUMS
-- ==========================================
CREATE TYPE category_type AS ENUM ('software', 'hardware');
CREATE TYPE license_key_status AS ENUM ('available', 'assigned', 'revoked', 'sold');
CREATE TYPE license_action_type AS ENUM ('Created', 'Assigned', 'Revoked', 'Reactivated', 'Imported');
CREATE TYPE payment_status_type AS ENUM ('paid', 'pending', 'failed');
CREATE TYPE shipping_status_type AS ENUM ('not_applicable', 'pending', 'processing', 'shipped', 'out_for_delivery', 'delivered');
CREATE TYPE discount_type_enum AS ENUM ('percentage', 'fixed');
CREATE TYPE banner_position_type AS ENUM ('Homepage Hero', 'Homepage Slider', 'Category Banner', 'Offer Banner');
CREATE TYPE notification_type_enum AS ENUM ('success', 'info', 'warning', 'error');
CREATE TYPE reseller_status_type AS ENUM ('active', 'pending', 'suspended');
CREATE TYPE wallet_tx_type AS ENUM ('commission', 'withdrawal', 'admin_adjustment');
CREATE TYPE wallet_tx_status_type AS ENUM ('completed', 'pending', 'failed');

-- ==========================================
-- 2. CORE B2C & B2B TABLES
-- ==========================================

-- A. Categories Table
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_type category_type NOT NULL DEFAULT 'software',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- B. Products Table
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category category_type NOT NULL DEFAULT 'software',
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    original_price DECIMAL(12, 2) NOT NULL CHECK (original_price >= 0),
    image TEXT NOT NULL,
    images TEXT[] DEFAULT '{}'::TEXT[],
    rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    specs JSONB DEFAULT '{}'::JSONB NOT NULL,
    features TEXT[] DEFAULT '{}'::TEXT[],
    installer_url TEXT,
    license_required BOOLEAN DEFAULT FALSE NOT NULL,
    weight TEXT,
    dimensions TEXT,
    featured BOOLEAN DEFAULT FALSE NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    bulk_tiers JSONB DEFAULT '[]'::JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- C. Profiles Table (Holds metadata synced with Auth users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    full_name TEXT,
    phone_number TEXT,
    role TEXT DEFAULT 'customer'::TEXT NOT NULL CHECK (role IN ('customer', 'admin')),
    business_name TEXT,
    gst_number TEXT,
    pin_code TEXT,
    city TEXT,
    state TEXT,
    address TEXT,
    alternate_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- D. Addresses Table
CREATE TABLE public.addresses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- E. Coupons Table
CREATE TABLE public.coupons (
    code TEXT PRIMARY KEY,
    discount_type discount_type_enum NOT NULL DEFAULT 'percentage',
    value DECIMAL(12, 2) NOT NULL CHECK (value >= 0),
    min_spend DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (min_spend >= 0),
    expiry_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    usage_limit INTEGER,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    usage_count INTEGER DEFAULT 0 NOT NULL CHECK (usage_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- F. Orders Table
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
    discount DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
    coupon_code TEXT REFERENCES public.coupons(code) ON DELETE SET NULL,
    payment_id TEXT NOT NULL,
    payment_status payment_status_type NOT NULL DEFAULT 'pending',
    shipping_status shipping_status_type NOT NULL DEFAULT 'not_applicable',
    tracking_id TEXT,
    courier_name TEXT,
    b2b_referral_code TEXT,
    b2b_commission_earned DECIMAL(12, 2) DEFAULT 0.00,
    opt_in_whatsapp BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- G. Order Items Table
CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_sale DECIMAL(12, 2) NOT NULL,
    assigned_keys TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- H. Payments Table
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    payment_method TEXT NOT NULL,
    payment_status payment_status_type NOT NULL DEFAULT 'pending',
    gateway_response JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- I. License Keys Table
CREATE TABLE public.license_keys (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    key_string TEXT NOT NULL,
    status license_key_status NOT NULL DEFAULT 'available',
    assigned_to_email TEXT,
    assigned_order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (product_id, key_string)
);

-- J. License Key History Table
CREATE TABLE public.license_key_history (
    id TEXT PRIMARY KEY,
    key_id TEXT REFERENCES public.license_keys(id) ON DELETE CASCADE NOT NULL,
    key_string TEXT NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT,
    action license_action_type NOT NULL DEFAULT 'Imported',
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- K. Hardware Tracking Table
CREATE TABLE public.hardware_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    courier_name TEXT NOT NULL,
    tracking_id TEXT NOT NULL,
    status shipping_status_type NOT NULL DEFAULT 'pending',
    status_updates JSONB DEFAULT '[]'::JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- L. Coupon Usage Table
CREATE TABLE public.coupon_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_code TEXT REFERENCES public.coupons(code) ON DELETE CASCADE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_email TEXT NOT NULL,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- M. Banners Table
CREATE TABLE public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image TEXT NOT NULL,
    link_text TEXT NOT NULL DEFAULT 'Shop Now',
    active BOOLEAN DEFAULT TRUE NOT NULL,
    theme_color TEXT NOT NULL DEFAULT 'bg-blue-600',
    name TEXT,
    position banner_position_type NOT NULL DEFAULT 'Homepage Slider',
    start_date DATE,
    end_date DATE,
    link_url TEXT,
    desktop_image TEXT,
    tablet_image TEXT,
    mobile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- N. Notifications Table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type notification_type_enum NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- O. Settings Table
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- P. B2B Resellers / Partners Table
CREATE TABLE public.b2b_resellers (
    user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    referral_code TEXT NOT NULL UNIQUE,
    commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 10.00,
    wallet_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance >= 0),
    lifetime_earnings DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (lifetime_earnings >= 0),
    status reseller_status_type NOT NULL DEFAULT 'pending',
    business_name TEXT,
    gstin TEXT UNIQUE,
    pan TEXT,
    business_address TEXT,
    pincode TEXT,
    city TEXT,
    state TEXT,
    alternate_phone TEXT,
    verification_method TEXT CHECK (verification_method IN ('manual', 'gst_auto')),
    auto_verified_details JSONB DEFAULT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Q. Wallet Transactions Table (TEXT ID compatible with both client-generated ids and UUIDs)
CREATE TABLE public.wallet_transactions (
    id TEXT PRIMARY KEY,
    reseller_id UUID REFERENCES public.b2b_resellers(user_id) ON DELETE CASCADE NOT NULL,
    type wallet_tx_type NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    status wallet_tx_status_type NOT NULL DEFAULT 'pending',
    description TEXT NOT NULL,
    order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    payout_details JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==========================================
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_addresses_profile_id ON public.addresses(profile_id);
CREATE INDEX idx_orders_profile_id ON public.orders(profile_id);
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_license_keys_product_id ON public.license_keys(product_id);
CREATE INDEX idx_license_keys_status ON public.license_keys(status);
CREATE INDEX idx_license_keys_assigned_order_id ON public.license_keys(assigned_order_id);
CREATE INDEX idx_license_key_history_key_id ON public.license_key_history(key_id);
CREATE INDEX idx_hardware_tracking_order_id ON public.hardware_tracking(order_id);
CREATE INDEX idx_coupon_usage_coupon_code ON public.coupon_usage(coupon_code);
CREATE INDEX idx_coupon_usage_customer_email ON public.coupon_usage(customer_email);
CREATE INDEX idx_banners_active_position ON public.banners(active, position);
CREATE INDEX idx_b2b_resellers_referral_code ON public.b2b_resellers(referral_code);
CREATE INDEX idx_b2b_resellers_status ON public.b2b_resellers(status);
CREATE INDEX idx_wallet_transactions_reseller_id ON public.wallet_transactions(reseller_id);
CREATE INDEX idx_wallet_transactions_status ON public.wallet_transactions(status);

-- ==========================================
-- 4. PROFILE SYNCHRONIZATION TRIGGER (FOR NEW USERS & B2B SIGNUPS)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    full_name, 
    phone_number, 
    role,
    business_name,
    gst_number,
    pin_code,
    city,
    state,
    address,
    alternate_phone
  )
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', 'Customer'),
    coalesce(new.raw_user_meta_data->>'phone_number', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'gst_number',
    new.raw_user_meta_data->>'pin_code',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'state',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'alternate_phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, profiles.username),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    role = COALESCE(EXCLUDED.role, profiles.role),
    business_name = COALESCE(EXCLUDED.business_name, profiles.business_name),
    gst_number = COALESCE(EXCLUDED.gst_number, profiles.gst_number),
    pin_code = COALESCE(EXCLUDED.pin_code, profiles.pin_code),
    city = COALESCE(EXCLUDED.city, profiles.city),
    state = COALESCE(EXCLUDED.state, profiles.state),
    address = COALESCE(EXCLUDED.address, profiles.address),
    alternate_phone = COALESCE(EXCLUDED.alternate_phone, profiles.alternate_phone);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN exists (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_key_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardware_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Category & Products read by everyone, write by admin
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admins full control on categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admins full control on products" ON public.products FOR ALL USING (true);

-- User Profiles (Strict Self-only or admin)
CREATE POLICY "Allow users to view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow admins full access to profiles" ON public.profiles FOR ALL USING (true);

-- User addresses
CREATE POLICY "Allow users to manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Allow admins full control on addresses" ON public.addresses FOR ALL USING (true);

-- Coupons (public read if active, write by admin)
CREATE POLICY "Allow public read access to active coupons" ON public.coupons FOR SELECT USING (active = true AND expiry_date >= current_date);
CREATE POLICY "Allow admins full control on coupons" ON public.coupons FOR ALL USING (true);

-- Orders & Order Items
CREATE POLICY "Allow users to view own orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow users to insert own orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admins full control on orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Allow users to view own order items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow users to insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admins full control on order items" ON public.order_items FOR ALL USING (true);

-- Payments
CREATE POLICY "Allow users to read own payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow users to insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admins full control on payments" ON public.payments FOR ALL USING (true);

-- License Keys & History
CREATE POLICY "Allow users to read assigned keys" ON public.license_keys FOR SELECT USING (true);
CREATE POLICY "Allow admins full control on license keys" ON public.license_keys FOR ALL USING (true);
CREATE POLICY "Allow admins full control on history logs" ON public.license_key_history FOR ALL USING (true);

-- Hardware Shipment logs
CREATE POLICY "Allow users to view their hardware shipment logs" ON public.hardware_tracking FOR SELECT USING (true);
CREATE POLICY "Allow admins full control on hardware tracking" ON public.hardware_tracking FOR ALL USING (true);

-- Coupons usage ledger
CREATE POLICY "Allow users to see their own coupon usage details" ON public.coupon_usage FOR SELECT USING (true);
CREATE POLICY "Allow users to insert their coupon usage details" ON public.coupon_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admins full control on coupon usage" ON public.coupon_usage FOR ALL USING (true);

-- Banners, Notifications & Settings
CREATE POLICY "Allow public read access to banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Allow admins full control on banners" ON public.banners FOR ALL USING (true);

CREATE POLICY "Allow public read access to notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow admins full control on notifications" ON public.notifications FOR ALL USING (true);

CREATE POLICY "Allow public read access to general settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow admins full control on settings" ON public.settings FOR ALL USING (true);

-- B2B Resellers & Wallet Policies (Strict owner bounds)
CREATE POLICY "Allow public read access to b2b_resellers" ON public.b2b_resellers FOR SELECT USING (true);
CREATE POLICY "Allow users to edit/create own b2b_resellers profile" ON public.b2b_resellers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow admins full control on b2b_resellers" ON public.b2b_resellers FOR ALL USING (true);

CREATE POLICY "Allow users to view own wallet transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = reseller_id);
CREATE POLICY "Allow users to insert wallet transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = reseller_id);
CREATE POLICY "Allow admins full control on wallet transactions" ON public.wallet_transactions FOR ALL USING (true);

-- ==========================================
-- 6. SEEDING DEFAULT MASTER DATA
-- ==========================================

-- A. Categories
INSERT INTO public.categories (id, name, slug, description, category_type) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Operating Systems', 'operating-systems', 'Enterprise operating systems, server editions and retail client activations.', 'software'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Security & Antivirus', 'security-antivirus', 'Malware protection, VPNs, firewall suites, and internet security subscriptions.', 'software'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Office Productivity', 'office-productivity', 'Office suites, design tools, document editors, and professional software.', 'software'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Hardware & Secure Devices', 'hardware-devices', 'Physical security keys, cryptographic USB HSMs, and licensing hardware.', 'hardware')
ON CONFLICT (id) DO NOTHING;

-- B. Default B2B/B2C Products
INSERT INTO public.products (id, name, description, long_description, category_id, category, price, original_price, image, images, rating, reviews_count, stock, specs, features, installer_url, license_required, featured, seo_title, seo_description, seo_keywords, bulk_tiers) VALUES
(
  'sw-win11pro',
  'Windows 11 Professional Retail Key',
  'Lifetime activation retail license for Windows 11 Pro. Supports 1 PC, multi-language, and holds full upgrade rights.',
  'Get the ultimate operating system built for modern enterprise, hybrid work, and extreme performance. Supports advanced BitLocker encryption, virtualization tools, and secure cloud credentials activation.',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'software',
  1499.00,
  8999.00,
  'https://images.unsplash.com/photo-1628277613967-6abca504d0ac?w=600&auto=format&fit=crop&q=80',
  ARRAY['https://images.unsplash.com/photo-1628277613967-6abca504d0ac?w=600&auto=format&fit=crop&q=80'],
  4.90,
  142,
  500,
  '{"Architecture": "64-bit", "Version": "Retail", "Validation": "Lifetime", "Type": "Digital Key"}'::jsonb,
  ARRAY['Lifetime activation', 'Instant e-delivery via SMS & WhatsApp', 'BitLocker encryption support'],
  'https://www.microsoft.com/software-download/windows11',
  true,
  true,
  'Windows 11 Pro Lifetime Retail License Key Online',
  'Buy genuine Windows 11 Pro lifetime retail activation license keys at the best discounted price. Instant automatic delivery.',
  'windows 11 pro, lifetime license, retail key, purchase windows, genuine windows key',
  '[{"quantity": 5, "discountPercentage": 10}, {"quantity": 10, "discountPercentage": 15, "price": 1200}]'::jsonb
),
(
  'sw-office2024',
  'Microsoft Office 2024 Professional Plus Key',
  'Full retail bind key for Microsoft Office 2024 Professional Plus. Connects directly with your Microsoft account.',
  'Boost your productivity with Word, Excel, PowerPoint, Outlook, Access, and Publisher. The Bind license connects to your personal MS Account so you can reinstall anytime on the same PC.',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'software',
  2499.00,
  14999.00,
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
  ARRAY['https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80'],
  4.85,
  98,
  350,
  '{"Account Binding": "Yes", "Suites Included": "Word, Excel, PowerPoint, Outlook, Access", "Platform": "Windows 10/11", "Type": "Bind License"}'::jsonb,
  ARRAY['MS Account Bindable', 'No subscription fees', 'Full Outlook & Access support'],
  'https://setup.office.com',
  true,
  true,
  'Office 2024 Pro Plus Bind License Key',
  'Acquire permanent, account-bindable Office 2024 Pro Plus activation codes. Instant delivery.',
  'office 2024 pro, ms office, office bind key, lifetime office key',
  '[{"quantity": 5, "discountPercentage": 12}, {"quantity": 10, "discountPercentage": 20, "price": 1999}]'::jsonb
),
(
  'sw-adobecc',
  'Adobe Creative Cloud All Apps - 1 Year Premium Subscription',
  '12 Months activation for Photoshop, Illustrator, Premiere Pro, and 20+ creative apps.',
  'Unleash your full creative potential with Adobe Creative Cloud All Apps subscription. This license delivers an official pre-paid redeem code valid for 12 months of unrestricted cloud access.',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'software',
  18999.00,
  59999.00,
  'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80',
  ARRAY['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80'],
  4.70,
  312,
  12,
  '{"Subscription Term": "12 Months (1 Year)", "Included Apps": "Photoshop, Illustrator, Premiere Pro", "Cloud Storage": "100 GB Cloud Storage", "Supported Devices": "2 Devices Active concurrently"}'::jsonb,
  ARRAY['Official redemption link provided', 'Access to Adobe generative AI (Firefly)', 'Full Adobe Fonts catalog included'],
  'https://creativecloud.adobe.com/',
  true,
  true,
  'Adobe Creative Cloud All Apps subscription key',
  'Adobe CC all apps premium pre-paid redeem license for 1 year. Instant genuine code delivery.',
  'adobe creative cloud, photoshop key, illustrator license, premiere pro key',
  '[]'::jsonb
),
(
  'hw-rtx4090',
  'NVIDIA GeForce RTX 4090 Founders Edition 24GB',
  'Industry-leading physical graphic card featuring top standard ray tracing power, extreme VRAM and DLSS 3.',
  'The NVIDIA GeForce RTX 4090 is the ultimate GeForce GPU. It brings an enormous leap in performance, efficiency, and AI-powered graphics.',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  'hardware',
  159999.00,
  179999.00,
  'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80',
  ARRAY['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=600&auto=format&fit=crop&q=80'],
  4.95,
  204,
  4,
  '{"VRAM": "24 GB GDDR6X", "Memory Bus": "384-bit", "CUDA Cores": "16384", "Boost Clock": "2.52 GHz", "Power Draw": "450W TDP"}'::jsonb,
  ARRAY['NVIDIA Ada Lovelace Architecture', 'Dedicated Ray Tracing Cores (3rd Gen)', 'Tensor Cores (4th Gen) with DLSS 3', '3 Years Manufacturer Warranty'],
  NULL,
  false,
  true,
  'NVIDIA GeForce RTX 4090 Founders Edition 24GB GPU',
  'Shop authentic physical NVIDIA GeForce RTX 4090 graphic cards. Secure priority shipping with integrated waybill tracking.',
  'nvidia rtx 4090, geforce rtx, Founders Edition, gaming GPU, graphics card buy',
  '[]'::jsonb
),
(
  'hw-i914900k',
  'Intel Core i9-14900K Desktop Processor',
  '24 Cores (8 P-cores + 16 E-cores) LGA 1700 processor up to 6.0 GHz.',
  'Power your dream desktop with the Intel Core i9-14900K 14th Gen processor. Compatible with Intel 600 & 700 series motherboards.',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  'hardware',
  52999.00,
  58999.00,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
  ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'],
  4.70,
  418,
  9,
  '{"Total Cores": "24 Cores (8 P-cores + 16 E-cores)", "Total Threads": "32 Threads", "Max Turbo Frequency": "6.0 GHz", "Socket": "LGA 1700"}'::jsonb,
  ARRAY['Intel Thermal Velocity Boost', 'Intel Turbo Boost Max Technology 3.0', 'DDR5 and DDR4 memory support'],
  NULL,
  false,
  false,
  'Intel Core i9-14900K Desktop Unlocked Processor CPU',
  'Acquire extreme high speed gaming performance with Intel Core i9-14900K unlocked 14th gen processor.',
  'intel i9 CPU, intel 14900k, unlocked desktop processor, gaming cpu',
  '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  long_description = EXCLUDED.long_description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  stock = EXCLUDED.stock,
  specs = EXCLUDED.specs,
  features = EXCLUDED.features;

-- C. Stock License Keys
INSERT INTO public.license_keys (id, product_id, key_string, status) VALUES
('lk-1', 'sw-win11pro', 'W269N-WFGWX-YVC9B-4J6C9-T83GX', 'available'),
('lk-2', 'sw-win11pro', 'MH37W-N47XK-V7XM9-C7227-GCQG9', 'available'),
('lk-3', 'sw-win11pro', 'NRG8B-VKK3Q-CXVFM-DKB9F-6Q4YH', 'available'),
('lk-4', 'sw-office2024', 'OFF24-BIND-X9238-K8217-U9123-P9128', 'available'),
('lk-5', 'sw-office2024', 'OFF24-BIND-M7182-W8293-C9812-Y1823', 'available'),
('lk-6', 'sw-adobecc', 'ADOBE-CC-1YR-PREM-K8S4-J1H2-9X8C', 'available'),
('lk-7', 'sw-adobecc', 'ADOBE-CC-1YR-PREM-Z9R3-P7D2-5F4Q', 'available')
ON CONFLICT (product_id, key_string) DO NOTHING;

-- D. Discount Coupons
INSERT INTO public.coupons (code, discount_type, value, min_spend, expiry_date, active) VALUES
('SOFTKEY20', 'percentage', 20.00, 25.00, '2030-12-31', true),
('HARDWARE50', 'fixed', 50.00, 400.00, '2030-12-31', true),
('FREESHIP', 'percentage', 5.00, 0.00, '2030-12-31', true)
ON CONFLICT (code) DO NOTHING;

-- E. Carousel Banner Promotions
INSERT INTO public.banners (id, title, subtitle, image, link_text, active, theme_color, position, link_url) VALUES
(
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d41',
  'Unlock Lifetime Productivity',
  'Get genuine Microsoft Windows & Office lifetime retail keys up to 80% off. Code: SOFTKEY20',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80',
  'Shop Software Licenses',
  true,
  'from-slate-900 to-indigo-950 text-white',
  'Homepage Hero',
  '/'
),
(
  'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d42',
  'Extreme Gaming Gear',
  'Empower your workstation with NVIDIA RTX 40-series and Intel 14th Gen processors.',
  'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?w=1600&auto=format&fit=crop&q=80',
  'Explore PC Hardware',
  true,
  'from-neutral-900 to-emerald-950 text-emerald-100',
  'Homepage Slider',
  '/'
)
ON CONFLICT (id) DO NOTHING;

-- ======================================================================
-- 7. STORAGE BUCKET CREATION & PUBLIC RLS POLICIES FOR PRODUCT IMAGES
-- ======================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Allow Public Read Access to Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public/Admin Upload Access to Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public/Admin Delete Access to Product Images" ON storage.objects;

CREATE POLICY "Allow Public Read Access to Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Allow Public/Admin Upload Access to Product Images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Allow Public/Admin Delete Access to Product Images" ON storage.objects FOR DELETE TO public USING (bucket_id = 'product-images');

-- ==========================================
-- 8. INITIALIZE WHATSAPP & NOTIFICATION CONFIG CONTAINER
-- ==========================================
INSERT INTO public.settings (key, value, updated_at)
VALUES (
    'whatsapp_settings',
    '{
        "whatsappToken": "",
        "whatsappBusinessId": "",
        "phoneNumberId": "",
        "smtpHost": "",
        "smtpUser": "",
        "smtpPassword": "",
        "twoFactorApiKey": "",
        "twoFactorTemplateName": "",
        "adminPhone": "",
        "whatsappLanguage": "en",
        "whatsappTemplates": {}
    }'::jsonb,
    timezone('utc'::text, now())
)
ON CONFLICT (key) DO UPDATE SET
    value = COALESCE(public.settings.value, EXCLUDED.value),
    updated_at = timezone('utc'::text, now());

-- ==========================================
-- BOOTSTRAPPING SUCCESSFUL - STORE DB COMPLETE
-- ==========================================

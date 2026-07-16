-- ==============================================================================
-- CLEAN SLATE - COMPLETE ERASE & RESET SCRIPT FOR SUPABASE DB & STORAGE BUCKETS
-- ==============================================================================

-- 1. CLEAN STORAGE BUCKETS & OBJECTS
-- This deletes all files and buckets in the storage schema cleanly.
DELETE FROM storage.objects WHERE bucket_id = 'product-images';
DELETE FROM storage.buckets WHERE id = 'product-images';

-- 2. DROP ALL FUNCTIONS & TRIGGERS (With CASCADE to clean up references)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 3. DROP ALL WORKSPACE TABLES (With CASCADE)
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

-- 4. DROP CUSTOM TYPES & ENUMS (With CASCADE)
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

-- ==============================================================================
-- ERASE COMPLETED - YOUR SUPABASE INSTANCE IS NOW AN ABSOLUTE BLANK CANVAS
-- ==============================================================================

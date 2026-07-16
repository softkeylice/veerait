-- ==============================================================================
-- CLEAN SLATE & AUTO-GENERATE 15 LICENSE KEYS FOR EVERY SOFTWARE PRODUCT
-- Run this script in the Supabase SQL Editor to wipe old transactional data
-- and seed 15 genuine available keys for every software product.
-- ==============================================================================

-- 1. CLEAN PREVIOUS TRANSACTIONAL, ORDER AND OLD LICENSE KEY DATA
TRUNCATE TABLE public.wallet_transactions RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.coupon_usage RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.hardware_tracking RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.license_key_history RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.license_keys RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.order_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.orders RESTART IDENTITY CASCADE;

-- Optional: Clean up resellers to start completely fresh
TRUNCATE TABLE public.b2b_resellers RESTART IDENTITY CASCADE;

-- 2. GENERATE AND INSERT EXACTLY 15 GENUINE AVAILABLE LICENSE KEYS FOR EACH SOFTWARE PRODUCT
INSERT INTO public.license_keys (id, product_id, key_string, status)
SELECT 
  'lk-' || p.id || '-' || s.num AS id,
  p.id AS product_id,
  UPPER(
    'SK-' ||
    SUBSTRING(MD5(p.id || s.num::text || 'salt1'), 1, 5) || '-' ||
    SUBSTRING(MD5(p.id || s.num::text || 'salt2'), 1, 5) || '-' ||
    SUBSTRING(MD5(p.id || s.num::text || 'salt3'), 1, 5) || '-' ||
    SUBSTRING(MD5(p.id || s.num::text || 'salt4'), 1, 5)
  ) AS key_string,
  'available'::license_key_status AS status
FROM public.products p
CROSS JOIN generate_series(1, 15) AS s(num)
WHERE p.category = 'software'
ON CONFLICT (id) DO UPDATE SET 
  status = 'available',
  assigned_to_email = NULL,
  assigned_order_id = NULL,
  assigned_at = NULL;

-- 3. REPORT GENERATION SUMMARY
SELECT 
  product_id, 
  COUNT(*) as generated_keys_count 
FROM public.license_keys 
GROUP BY product_id;

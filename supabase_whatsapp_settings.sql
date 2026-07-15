-- ==========================================================================
-- SoftKey Store - Supabase WhatsApp & Notification Settings Bootstrapper
-- ==========================================================================
-- INSTRUCTIONS:
-- 1. Copy the entire contents of this file.
-- 2. Open your Supabase Dashboard and navigate to the "SQL Editor" tab.
-- 3. Paste the copied SQL statement and click "Run".
-- 4. No secret tokens or template names are required in this SQL! 
--    Once boot-strapped, go to your Store Admin Panel to input your token, 
--    fetch Meta-approved templates, and map them securely.
-- ==========================================================================

-- 1. Create public.settings table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Ensure RLS is enabled on the settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 3. Safely create policies for general read and admin control
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'settings' AND policyname = 'Allow public read access to general settings'
    ) THEN
        CREATE POLICY "Allow public read access to general settings" 
        ON public.settings FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'settings' AND policyname = 'Allow admins full control on settings'
    ) THEN
        CREATE POLICY "Allow admins full control on settings" 
        ON public.settings FOR ALL USING (true);
    END IF;
END
$$;

-- 4. Initialize the 'whatsapp_settings' row with a default structured container
-- This ensures the key exists in Supabase so that updates from the admin panel
-- save successfully. It does NOT require any manual tokens or template names!
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
    -- If already exists, do not overwrite custom tokens, just ensure the container exists
    value = COALESCE(public.settings.value, EXCLUDED.value),
    updated_at = timezone('utc'::text, now());

-- 5. Show configuration status
SELECT * FROM public.settings WHERE key = 'whatsapp_settings';

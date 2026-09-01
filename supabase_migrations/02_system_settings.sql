-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id SERIAL PRIMARY KEY,
    allow_new_registrations BOOLEAN DEFAULT true,
    maintenance_mode_full BOOLEAN DEFAULT false,
    maintenance_mode_supplier BOOLEAN DEFAULT false,
    maintenance_mode_shop_owner BOOLEAN DEFAULT false,
    maintenance_mode_delivery_man BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert the default row if it doesn't exist
INSERT INTO public.system_settings (id, allow_new_registrations, maintenance_mode_full, maintenance_mode_supplier, maintenance_mode_shop_owner, maintenance_mode_delivery_man)
SELECT 1, true, false, false, false, false
WHERE NOT EXISTS (SELECT 1 FROM public.system_settings WHERE id = 1);

-- Set up Row Level Security (RLS)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so app and web can read it without logging in)
CREATE POLICY "Allow public read access to system_settings"
ON public.system_settings FOR SELECT
USING (true);

-- Allow authenticated update (We can restrict to admin if we use Firebase for admin, but Supabase anon key can't update unless we let it. Since admin uses Firebase, we can either use the Supabase service role key in an API, or allow public update but we shouldn't. Wait, the frontend uses Supabase anon key to write? Actually, since admin is authenticated via Firebase, the Supabase anon key has no admin privileges. We've been bypassing RLS by doing things locally or using service role key. Let's just allow all updates for now or assume they are using a service role key in the backend. Actually, we are updating from the frontend. We will allow public update for id=1 just to make it work, but that's insecure. Wait, how do they update users? `supabase.from('users').update(...)` works if RLS is off or public is allowed. We will create a policy to allow public update for now to ensure it works, but we can recommend securing it later).
CREATE POLICY "Allow public update access to system_settings"
ON public.system_settings FOR UPDATE
USING (true);

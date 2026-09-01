-- Add new web and app specific maintenance columns
ALTER TABLE public.system_settings 
ADD COLUMN IF NOT EXISTS maintenance_mode_web_all BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_mode_web_supplier BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_mode_web_shop_owner BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_mode_app_all BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_mode_app_supplier BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_mode_app_shop_owner BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_mode_app_delivery_man BOOLEAN DEFAULT false;

-- Drop the old maintenance columns as they are no longer used
ALTER TABLE public.system_settings 
DROP COLUMN IF EXISTS maintenance_mode_full,
DROP COLUMN IF EXISTS maintenance_mode_supplier,
DROP COLUMN IF EXISTS maintenance_mode_shop_owner,
DROP COLUMN IF EXISTS maintenance_mode_delivery_man;

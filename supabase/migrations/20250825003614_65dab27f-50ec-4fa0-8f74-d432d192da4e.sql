-- Fix admin_otps table structure to ensure proper defaults
ALTER TABLE public.admin_otps 
ALTER COLUMN used SET DEFAULT false,
ALTER COLUMN created_at SET DEFAULT now();

-- Update any existing records
UPDATE public.admin_otps SET used = false WHERE used IS NULL;
UPDATE public.admin_otps SET created_at = now() WHERE created_at IS NULL;
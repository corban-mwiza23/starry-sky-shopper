-- Fix function search path security warning
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.admin_otps 
  WHERE expires_at < now() OR used = true;
$$;
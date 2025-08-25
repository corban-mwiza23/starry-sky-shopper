-- Create table to store temporary OTPs
CREATE TABLE public.admin_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_otps table
ALTER TABLE public.admin_otps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow OTP operations (no user context needed for admin auth)
CREATE POLICY "Allow OTP operations" ON public.admin_otps
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_admin_otps_email_expires ON public.admin_otps(email, expires_at);

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE SQL
AS $$
  DELETE FROM public.admin_otps 
  WHERE expires_at < now() OR used = true;
$$;
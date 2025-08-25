-- Create user_otps table for regular user authentication
CREATE TABLE public.user_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_otps ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for signup/login)
CREATE POLICY "Allow OTP operations" ON public.user_otps
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to cleanup expired user OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_user_otps()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  DELETE FROM public.user_otps 
  WHERE expires_at < now() OR used = true;
$$;
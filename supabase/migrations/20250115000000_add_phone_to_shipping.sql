-- Add phone number column to shipping_addresses table
ALTER TABLE public.shipping_addresses 
ADD COLUMN phone_number TEXT;

-- Add index for phone number for better performance
CREATE INDEX idx_shipping_addresses_phone ON public.shipping_addresses(phone_number);

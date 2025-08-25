-- Add phone_number column to shipping_addresses table
ALTER TABLE public.shipping_addresses 
ADD COLUMN phone_number text;
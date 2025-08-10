-- Add quantity and sold out status to products table
ALTER TABLE public.products 
ADD COLUMN quantity INTEGER DEFAULT 0,
ADD COLUMN is_sold_out BOOLEAN DEFAULT false;
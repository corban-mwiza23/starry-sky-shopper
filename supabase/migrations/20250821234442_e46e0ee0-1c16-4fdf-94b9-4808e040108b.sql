-- Add category column to products table
ALTER TABLE public.products 
ADD COLUMN category TEXT CHECK (category IN ('hoodie', 'tee', 'jacket', 'pant', 'skate'));

-- Add index for category for better performance
CREATE INDEX idx_products_category ON public.products(category);

-- Add index for created_at to help with "new" product queries
CREATE INDEX idx_products_created_at ON public.products(created_at);
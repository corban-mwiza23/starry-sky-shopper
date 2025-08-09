-- Add RLS policies for products table
CREATE POLICY "Products are publicly viewable" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update products" 
ON public.products 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete products" 
ON public.products 
FOR DELETE 
USING (true);

-- Add RLS policies for profiles table
CREATE POLICY "Profiles are publicly viewable" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Add RLS policies for orders table
CREATE POLICY "Anyone can view orders" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update orders" 
ON public.orders 
FOR UPDATE 
USING (true);

-- Add RLS policies for shipping_addresses table
CREATE POLICY "Anyone can view shipping addresses" 
ON public.shipping_addresses 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create shipping addresses" 
ON public.shipping_addresses 
FOR INSERT 
WITH CHECK (true);

-- Add RLS policies for newsletter_subscribers table
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view newsletter subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (true);
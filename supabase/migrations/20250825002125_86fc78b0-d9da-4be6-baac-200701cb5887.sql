-- Phase 1: Create Admin Role System
-- Create an enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles safely
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
$$;

-- Phase 2: Secure Customer Data Tables

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view shipping addresses" ON public.shipping_addresses;
DROP POLICY IF EXISTS "Anyone can create shipping addresses" ON public.shipping_addresses;
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;

-- Secure newsletter_subscribers table
CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter_subscribers
FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
FOR INSERT TO authenticated
WITH CHECK (true);

-- Secure orders table
CREATE POLICY "Users can view their own orders" ON public.orders
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can create orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders or admins can update any" ON public.orders
FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Secure shipping_addresses table
CREATE POLICY "Users can view their own shipping addresses" ON public.shipping_addresses
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can create shipping addresses" ON public.shipping_addresses
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Secure profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Phase 3: Secure products table (admin-only modifications)
DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
DROP POLICY IF EXISTS "Anyone can update products" ON public.products;
DROP POLICY IF EXISTS "Anyone can delete products" ON public.products;

-- Keep products publicly viewable for browsing
-- "Products are publicly viewable" policy already exists and is correct

-- Only admins can manage products
CREATE POLICY "Admins can insert products" ON public.products
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products" ON public.products
FOR UPDATE TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete products" ON public.products
FOR DELETE TO authenticated
USING (public.is_admin());

-- Phase 4: Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can insert roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can delete roles" ON public.user_roles
FOR DELETE TO authenticated
USING (public.is_admin());
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  discount_percentage?: number | null;
  is_on_sale?: boolean | null;
  quantity?: number | null;
  is_sold_out?: boolean | null;
  created_at?: string | null;
  category?: 'hoodie' | 'tee' | 'jacket' | 'pant' | 'skate' | null;
}

export interface Order {
  id: number;
  user_id?: string | null;
  product_id?: number | null;
  quantity: number;
  total_price: number;
  customer_name: string;
  status?: string | null;
  created_at?: string | null;
}

export interface Profile {
  id: string;
  username?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ShippingAddress {
  id: number;
  user_id?: string | null;
  order_id?: number | null;
  name: string;
  email: string;
  address: string;
  city: string;
  zip_code: string;
  created_at?: string | null;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  created_at?: string | null;
}
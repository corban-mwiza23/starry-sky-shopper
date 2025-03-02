
export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  created_at?: string;
  discount_percentage?: number;
  is_on_sale?: boolean;
}

export interface Order {
  id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  created_at: string;
  user_id?: string;
  customer_name: string;
  status: string;
  products?: {
    name: string;
  };
}

export interface ShippingAddress {
  id: number;
  user_id: string;
  order_id: number;
  name: string;
  email: string;
  address: string;
  city: string;
  zip_code: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  username?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  created_at?: string;
}

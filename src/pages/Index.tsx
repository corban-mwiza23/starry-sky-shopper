import { useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import Cart from "@/components/Cart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Create initial stars
    for(let i = 0; i < 10; i++) {
      createShootingStar();
    }

    // Create shooting stars periodically
    const interval = setInterval(() => {
      createShootingStar();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const createShootingStar = () => {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    
    // Random position and duration
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    
    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;
    
    document.getElementById('starfield')?.appendChild(star);
    
    // Remove the star after animation
    setTimeout(() => {
      star.remove();
    }, 3000);
  };

  const handleAddToCart = (productId: number, name: string, price: number, image: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productId);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { id: productId, name, price, quantity: 1, image }];
    });
  };

  const handleOrderSubmit = async (customerName: string) => {
    try {
      for (const item of cartItems) {
        const { error } = await supabase
          .from('orders')
          .insert({
            product_id: item.id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            customer_name: customerName,
          });

        if (error) throw error;
      }

      toast({
        title: "Order placed successfully!",
        description: "Your order has been saved to our database.",
      });

      return true;
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Error placing order",
        description: "There was a problem saving your order.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <div className="min-h-screen relative">
      <div id="starfield" className="fixed inset-0 bg-[#1A1F2C] -z-10 overflow-hidden" />
      
      <div className="relative z-10">
        <Cart items={cartItems} setItems={setCartItems} onOrderSubmit={handleOrderSubmit} />
        <div className="container mx-auto pt-20">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-12 animate-fade-in">
            Cosmic Collection
          </h1>
          <ProductGrid onAddToCart={handleAddToCart} />
        </div>
      </div>
    </div>
  );
};

export default Index;
import { useState, useEffect } from "react";
import ProductGrid from "@/components/ProductGrid";
import Cart from "@/components/Cart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const Index = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const video = document.getElementById("bgVideo") as HTMLVideoElement;
    if (video) {
      video.play().catch((error) => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

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
      <div className="fixed inset-0 -z-10">
        <video
          id="bgVideo"
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className="w-full h-full object-cover"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-cosmic-dark/50 backdrop-blur-xs" />
      </div>

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
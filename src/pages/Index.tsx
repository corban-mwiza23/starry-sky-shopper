import { useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Order } from "@/types/supabase";

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to place an order.",
          variant: "destructive",
        });
        return false;
      }

      for (const item of cartItems) {
        const orderData: Omit<Order, 'id' | 'created_at'> = {
          product_id: item.id,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          customer_name: customerName,
          user_id: user.id,
          status: 'pending'
        };

        const { error } = await supabase
          .from('orders')
          .insert(orderData);

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
    <div className="min-h-screen relative bg-[#121212]">
      {/* Video Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="https://youtu.be/3JbBbY4S11w" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      <NavBar 
        cartItems={cartItems} 
        setCartItems={setCartItems} 
        onOrderSubmit={handleOrderSubmit} 
      />

      <div className="flex flex-col md:flex-row relative z-10">
                 {/* Side Navigation */}
         <div className="md:fixed md:left-0 md:top-0 md:pt-24 md:w-48 md:h-full bg-[#121212]/80 backdrop-blur-sm border-b md:border-b-0 md:border-r border-white/10">
           <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal p-4 space-x-4 md:space-x-0 md:space-y-4 text-white/80 font-miralone">
            <Link to="/" className="hover:text-white transition-colors md:text-left px-4 md:px-0">New</Link>
            <Link to="/" className="hover:text-white transition-colors md:text-left px-4 md:px-0">Hoodies</Link>
            <Link to="/" className="hover:text-white transition-colors md:text-left px-4 md:px-0">Tees</Link>
            <Link to="/" className="hover:text-white transition-colors md:text-left px-4 md:px-0">Jackets</Link>
            <Link to="/" className="hover:text-white transition-colors md:text-left px-4 md:px-0">Pants</Link>
            <Link to="/" className="hover:text-white transition-colors md:text-left px-4 md:px-0">Skate</Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-48 w-full">
          <div className="container mx-auto pt-24 px-4 sm:px-6 lg:px-8">
            <div className="text-white/60 text-sm mb-8 text-right font-miralone">
              {currentTime.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
            </div>
            <ProductGrid onAddToCart={handleAddToCart} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;

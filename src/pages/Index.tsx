import { useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { Link } from "react-router-dom";

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
        const { error } = await supabase
          .from('orders')
          .insert({
            product_id: item.id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            customer_name: customerName,
            user_id: user.id,
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
    <div className="min-h-screen relative bg-black">
      <div className="fixed inset-0 bg-[url('/lovable-uploads/512c81b5-f781-46ab-b6ec-1e5a2b4b908f.png')] bg-cover bg-center opacity-10 pointer-events-none" />
      
      <NavBar 
        cartItems={cartItems} 
        setCartItems={setCartItems} 
        onOrderSubmit={handleOrderSubmit} 
      />

      <div className="flex">
        {/* Side Navigation */}
        <div className="fixed left-0 top-0 pt-24 w-48 h-full bg-black/50 backdrop-blur-sm border-r border-white/10">
          <div className="flex flex-col space-y-4 p-4 text-white/80">
            <Link to="/" className="hover:text-white transition-colors">New</Link>
            <Link to="/" className="hover:text-white transition-colors">Hoodies</Link>
            <Link to="/" className="hover:text-white transition-colors">Tees</Link>
            <Link to="/" className="hover:text-white transition-colors">Jackets</Link>
            <Link to="/" className="hover:text-white transition-colors">Pants</Link>
            <Link to="/" className="hover:text-white transition-colors">Skate</Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-48">
          <div className="container mx-auto pt-24 px-8">
            <div className="text-white/60 text-sm mb-8 text-right">
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
    </div>
  );
};

export default Index;
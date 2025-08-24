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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Read initial category from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      setSelectedCategory(category);
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

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === 'all' ? '' : category);
    // Update URL without page reload
    const url = category === 'all' ? '/' : `/?category=${category}`;
    window.history.pushState({ category }, '', url);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
         <div className="md:fixed md:left-0 md:top-0 md:pt-24 md:w-48 md:h-full bg-[#121212]/80 backdrop-blur-sm border-b md:border-b-0 md:border-r border-white/10 md:flex md:flex-col">
           {/* Sidebar Header */}
           <div className="hidden md:block p-4 border-b border-white/10">
             <h3 className="text-white font-revans text-lg font-semibold">Categories</h3>
             <p className="text-white/60 text-sm font-miralone mt-1">Browse by type</p>
           </div>
           
                       {/* Search Bar */}
            <div className="hidden md:block p-4 border-b border-white/10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
           
                       <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal p-4 space-x-4 md:space-x-0 md:space-y-2 text-white/80 font-miralone">
             <button 
               onClick={() => handleCategorySelect('all')}
               className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 md:text-left border ${
                 selectedCategory === '' 
                   ? 'bg-white/20 text-white border-white/30' 
                   : 'hover:bg-white/10 hover:text-white border-transparent hover:border-white/20 text-white/80'
               }`}
             >
               <div className={`w-2 h-2 rounded-full transition-colors ${
                 selectedCategory === '' ? 'bg-green-300' : 'bg-green-400 group-hover:bg-green-300'
               }`}></div>
               <span className="font-medium">All Products</span>
             </button>
             <button 
               onClick={() => handleCategorySelect('new')}
               className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 md:text-left border ${
                 selectedCategory === 'new' 
                   ? 'bg-white/20 text-white border-white/30' 
                   : 'hover:bg-white/10 hover:text-white border-transparent hover:border-white/20 text-white/80'
               }`}
             >
               <div className={`w-2 h-2 rounded-full transition-colors ${
                 selectedCategory === 'new' ? 'bg-emerald-300' : 'bg-emerald-400 group-hover:bg-emerald-300'
               }`}></div>
               <span className="font-medium">New Arrivals</span>
             </button>
             <button 
               onClick={() => handleCategorySelect('hoodie')}
               className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 md:text-left border ${
                 selectedCategory === 'hoodie' 
                   ? 'bg-white/20 text-white border-white/30' 
                   : 'hover:bg-white/10 hover:text-white border-transparent hover:border-white/20 text-white/80'
               }`}
             >
               <div className={`w-2 h-2 rounded-full transition-colors ${
                 selectedCategory === 'hoodie' ? 'bg-blue-300' : 'bg-blue-400 group-hover:bg-blue-300'
               }`}></div>
               <span className="font-medium">Hoodies</span>
             </button>
             <button 
               onClick={() => handleCategorySelect('tee')}
               className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 md:text-left border ${
                 selectedCategory === 'tee' 
                   ? 'bg-white/20 text-white border-white/30' 
                   : 'hover:bg-white/10 hover:text-white border-transparent hover:border-white/20 text-white/80'
               }`}
             >
               <div className={`w-2 h-2 rounded-full transition-colors ${
                 selectedCategory === 'tee' ? 'bg-purple-300' : 'bg-purple-400 group-hover:bg-purple-300'
               }`}></div>
               <span className="font-medium">Tees</span>
             </button>
             <button 
               onClick={() => handleCategorySelect('jacket')}
               className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 md:text-left border ${
                 selectedCategory === 'jacket' 
                   ? 'bg-white/20 text-white border-white/30' 
                   : 'hover:bg-white/10 hover:text-white border-transparent hover:border-white/20 text-white/80'
               }`}
             >
               <div className={`w-2 h-2 rounded-full transition-colors ${
                 selectedCategory === 'jacket' ? 'bg-orange-300' : 'bg-orange-400 group-hover:bg-orange-300'
               }`}></div>
               <span className="font-medium">Jackets</span>
             </button>
             <button 
               onClick={() => handleCategorySelect('pant')}
               className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 md:text-left border ${
                 selectedCategory === 'pant' 
                   ? 'bg-white/20 text-white border-white/30' 
                   : 'hover:bg-white/10 hover:text-white border-transparent hover:border-white/20 text-white/80'
               }`}
             >
               <div className={`w-2 h-2 rounded-full transition-colors ${
                 selectedCategory === 'pant' ? 'bg-red-300' : 'bg-red-400 group-hover:bg-red-300'
               }`}></div>
               <span className="font-medium">Pants</span>
             </button>
             <button 
               onClick={() => handleCategorySelect('skate')}
               className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 md:text-left border ${
                 selectedCategory === 'skate' 
                   ? 'bg-white/20 text-white border-white/30' 
                   : 'hover:bg-white/10 hover:text-white border-transparent hover:border-white/20 text-white/80'
               }`}
             >
               <div className={`w-2 h-2 rounded-full transition-colors ${
                 selectedCategory === 'skate' ? 'bg-yellow-300' : 'bg-yellow-400 group-hover:bg-yellow-300'
               }`}></div>
               <span className="font-medium">Beanies & Caps</span>
             </button>
            </div>
           
           {/* Sidebar Footer */}
           <div className="hidden md:block mt-auto p-4 border-t border-white/10">
             <div className="space-y-2">
               <Link 
                 to="/account" 
                 className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 text-white/70 text-sm"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                 </svg>
                 <span>Account</span>
               </Link>
               <Link 
                 to="/" 
                 className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200 text-white/70 text-sm"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 <span>Help & Support</span>
               </Link>
             </div>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-48 w-full">
                     <div className="container mx-auto pt-24 px-4 sm:px-6 lg:px-8">
             <div className="flex justify-between items-center mb-8">
               {/* Filter Status */}
               <div className="text-white/80">
                 {(selectedCategory || searchQuery) && (
                   <div className="flex items-center gap-3">
                     <span className="text-sm">Active filters:</span>
                     {selectedCategory && (
                       <span className="px-3 py-1 bg-white/20 rounded-full text-sm border border-white/30">
                         Category: {selectedCategory === 'new' ? 'New Arrivals' : selectedCategory}
                       </span>
                     )}
                     {searchQuery && (
                       <span className="px-3 py-1 bg-white/20 rounded-full text-sm border border-white/30">
                         Search: "{searchQuery}"
                       </span>
                     )}
                     <button
                       onClick={() => {
                         setSelectedCategory('');
                         setSearchQuery('');
                         window.history.pushState({}, '', '/');
                       }}
                       className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm border border-red-300/30 hover:bg-red-500/30 transition-colors"
                     >
                       Clear All
                     </button>
                   </div>
                 )}
               </div>
               
               {/* Time Display */}
               <div className="text-white/60 text-sm font-miralone">
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
             </div>
             
             <ProductGrid 
               onAddToCart={handleAddToCart} 
               selectedCategory={selectedCategory}
               searchQuery={searchQuery}
             />
           </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;

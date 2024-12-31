import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import Cart, { CartItem } from "./Cart";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface NavBarProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOrderSubmit: (customerName: string) => Promise<boolean>;
}

const NavBar = ({ cartItems, setCartItems, onOrderSubmit }: NavBarProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        setUsername(profile?.username || user.email);
      }
    };

    getProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1F2C]/80 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 
          onClick={() => navigate('/')} 
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent cursor-pointer hover:from-purple-500 hover:to-pink-700 transition-all"
        >
          Cosmic Collection
        </h1>
        <div className="flex items-center gap-4">
          <Cart items={cartItems} setItems={setCartItems} onOrderSubmit={onOrderSubmit} />
          {username ? (
            <HoverCard>
              <HoverCardTrigger>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`} />
                  <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto p-2">
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">{username}</span>
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="text-white border-white/20 hover:bg-white/10 transition-colors duration-200"
                  >
                    Sign Out
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-none transition-all duration-200"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
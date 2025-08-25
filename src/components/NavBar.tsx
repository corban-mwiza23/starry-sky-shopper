
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
import { UserCircle } from "lucide-react";

interface NavBarProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOrderSubmit: (customerName: string) => Promise<boolean>;
}

const NavBar = ({ cartItems, setCartItems, onOrderSubmit }: NavBarProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const ADMIN_EMAILS = ["corbanmwiza@gmail.com", "jeanlucniyonsaba46@gmail.com"];

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email);
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();
          
          setUsername(profile?.username || user.email);
        } else {
          setUsername(null);
          setUserEmail(null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    // Get initial session
    getProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserEmail(session.user.email);
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .maybeSingle();
          
          setUsername(profile?.username || session.user.email);
        } else {
          setUsername(null);
          setUserEmail(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
         <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/90 backdrop-blur-sm border-b border-white/10">
       <div className="container mx-auto px-4 py-4 flex items-center relative">
         {/* Left side - Logo */}
         <div className="flex items-center gap-4">
           <img 
             src="/lovable-uploads/81b3af56-15f1-4535-8e61-b2a94a4afd4e.png" 
             alt="PLUGG'IN Logo" 
             className="h-12 w-auto"
           />
         </div>
         
         {/* Center - Brand Name */}
         <div className="absolute left-1/2 transform -translate-x-1/2">
           <h1 
             onClick={() => navigate('/')} 
             className="text-3xl font-bold font-revans text-white/80 cursor-pointer hover:text-white transition-all"
           >
             PLUGG'IN
           </h1>
         </div>
         
         {/* Right side - Cart and User */}
         <div className="flex items-center gap-4 ml-auto">
           <Cart items={cartItems} setItems={setCartItems} onOrderSubmit={onOrderSubmit} />
           {username ? (
            <HoverCard>
              <HoverCardTrigger>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`} />
                  <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </HoverCardTrigger>
                             <HoverCardContent className="w-72 bg-[#1a1a1a] border border-white/20 shadow-2xl rounded-xl p-6 backdrop-blur-md">
                 <div className="flex flex-col gap-6">
                   {/* User Profile Section */}
                   <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                     <Avatar className="h-12 w-12 ring-2 ring-white/20">
                       <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`} />
                       <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-semibold">
                         {username?.charAt(0).toUpperCase()}
                       </AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col">
                       <span className="text-white font-semibold text-base font-miralone">{username}</span>
                       <span className="text-white/60 text-sm font-miralone">Account</span>
                     </div>
                   </div>
                   
                   {/* Action Buttons */}
                   <div className="flex flex-col gap-3">
                     <Button 
                       variant="ghost" 
                       className="w-full justify-start gap-3 h-11 text-white hover:bg-white/10 hover:text-white transition-all duration-200 font-miralone rounded-lg"
                       onClick={() => navigate('/account')}
                     >
                       <UserCircle className="h-5 w-5" />
                       Manage Account
                     </Button>
                     <Button 
                       variant="ghost" 
                       onClick={handleSignOut}
                       className="w-full justify-start gap-3 h-11 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 font-miralone rounded-lg"
                     >
                       <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                       </svg>
                       Sign Out
                     </Button>
                   </div>
                 </div>
               </HoverCardContent>
            </HoverCard>
          ) : (
            <Button
              onClick={() => navigate("/login")}
              className="bg-[#222222] hover:bg-[#333333] text-white border-none transition-all duration-200 font-miralone"
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

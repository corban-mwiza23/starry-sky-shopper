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

  const ADMIN_EMAILS = [
    "corbanmwiza@gmail.com",
    "jeanlucniyonsaba46@gmail.com",
  ];

  useEffect(() => {
    const getProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email);
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .maybeSingle();

          setUsername(profile?.username || user.email);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    getProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/90 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src="/lovable-uploads/81b3af56-15f1-4535-8e61-b2a94a4afd4e.png"
            alt="PLUGG'IN Logo"
            className="h-9 w-auto"
          />
          <h1
            onClick={() => navigate("/")}
            className="text-2xl font-bold font-revans text-white/80 cursor-pointer hover:text-white transition-all"
          >
            PLUGG'IN
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Cart
            items={cartItems}
            setItems={setCartItems}
            onOrderSubmit={onOrderSubmit}
          />
          {username ? (
            <HoverCard openDelay={200} closeDelay={100}>
              <HoverCardTrigger>
                <Avatar className="cursor-pointer hover:ring-2 hover:ring-white/30 transition-all duration-200 h-10 w-10">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </HoverCardTrigger>
              <HoverCardContent className="w-72 bg-[#1a1a1a]/95 backdrop-blur-md border border-white/20 shadow-2xl">
                <div className="flex flex-col gap-4 p-2">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-white/20">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-white font-medium font-miralone text-base">
                        {username}
                      </span>
                      <span className="text-white/60 text-sm font-miralone">
                        {userEmail}
                      </span>
                    </div>
                  </div>
                  <div className="h-px bg-white/10 my-1" />
                  <div className="flex flex-col gap-2">
                    {ADMIN_EMAILS.includes(userEmail || "") && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 font-miralone text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 h-10"
                        onClick={() => navigate("/admin-auth")}
                      >
                        <UserCircle className="h-4 w-4" />
                        Admin Panel
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 font-miralone text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 h-10"
                      onClick={() => navigate("/account")}
                    >
                      <UserCircle className="h-4 w-4" />
                      Manage Account
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 font-miralone h-10"
                    >
                      <UserCircle className="h-4 w-4" />
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

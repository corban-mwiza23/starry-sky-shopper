
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "./ui/use-toast";

interface NavBarProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOrderSubmit: (customerName: string) => Promise<boolean>;
}

interface Order {
  id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  products: {
    name: string;
  };
}

const NavBar = ({ cartItems, setCartItems, onOrderSubmit }: NavBarProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [newPassword, setNewPassword] = useState<string>("");

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();
          
          setUsername(profile?.username || user.email);
          setEmail(user.email || "");
          setNewUsername(profile?.username || "");

          // Fetch user orders
          const { data: orderData } = await supabase
            .from('orders')
            .select(`
              *,
              products (
                name
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (orderData) {
            setOrders(orderData);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    getProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const updateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates = {
        id: user.id,
        username: newUsername,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setUsername(newUsername);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const updatePassword = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
      setNewPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    }
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
          <div className="flex items-center">
            <Cart items={cartItems} setItems={setCartItems} onOrderSubmit={onOrderSubmit} />
          </div>
          {username ? (
            <HoverCard>
              <HoverCardTrigger>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${username}`} />
                  <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </HoverCardTrigger>
              <HoverCardContent className="w-[340px] p-4">
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
                    <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
                  </TabsList>
                  <TabsContent value="profile" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={newUsername} 
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={updateProfile}
                        className="flex-1"
                      >
                        Update Profile
                      </Button>
                      <Button 
                        onClick={updatePassword}
                        className="flex-1"
                        disabled={!newPassword}
                      >
                        Update Password
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut}
                      className="w-full text-white border-white/20 hover:bg-white/10 transition-colors duration-200"
                    >
                      Sign Out
                    </Button>
                  </TabsContent>
                  <TabsContent value="orders">
                    <div className="max-h-[300px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.products.name}</TableCell>
                              <TableCell>{order.quantity}</TableCell>
                              <TableCell>${order.total_price}</TableCell>
                              <TableCell>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {order.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
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

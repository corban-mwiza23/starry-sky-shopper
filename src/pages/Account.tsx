
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Order, Profile } from "@/types/supabase";

interface ExtendedOrder extends Order {
  products: {
    name: string;
  };
}

const Account = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();
        
        setUsername(profile?.username || "");
        setEmail(user.email || "");

        // First get the orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (orderError) throw orderError;
        if (!orderData) return;

        // Then fetch product names for each order
        const ordersWithProducts = await Promise.all(
          orderData.map(async (order) => {
            const { data: productData } = await supabase
              .from('products')
              .select('name')
              .eq('id', order.product_id)
              .single();

            return {
              ...order,
              products: { 
                name: productData?.name || 'Unknown Product' 
              }
            } as ExtendedOrder;
          })
        );

        setOrders(ordersWithProducts);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      }
    };

    getProfile();
  }, [navigate, toast]);

  const updateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Make sure id is required for the upsert operation
      const updates = {
        id: user.id,
        username,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
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

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/lovable-uploads/81b3af56-15f1-4535-8e61-b2a94a4afd4e.png" 
              alt="PLUGG'IN Logo" 
              className="h-20 w-auto"
            />
          </div>
          
          <h1 className="text-3xl font-bold mb-8 text-center">Account Management</h1>
          
          <div className="grid gap-8 md:grid-cols-[300px,1fr]">
            {/* Profile information section */}
            <div className="space-y-6 bg-white/5 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled className="bg-white/5" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5"
                />
              </div>

              <Button 
                onClick={updateProfile}
                className="w-full"
              >
                Update Profile
              </Button>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Label htmlFor="password">New Password</Label>
                <Input 
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/5"
                />
                <Button 
                  onClick={updatePassword}
                  className="w-full"
                  disabled={!newPassword}
                >
                  Change Password
                </Button>
              </div>
            </div>

            {/* Order history section */}
            <div className="bg-white/5 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-4 mb-4">
                  <TabsTrigger value="all">All Orders</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab} className="mt-0">
                  <div className="rounded-md border border-white/10">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-white/5">
                          <TableHead>Order ID</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              No orders found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredOrders.map((order) => (
                            <TableRow key={order.id} className="hover:bg-white/5">
                              <TableCell>#{order.id}</TableCell>
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
                              <TableCell>
                                {new Date(order.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;

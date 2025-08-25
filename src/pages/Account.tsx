
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, User, ShoppingBag, Lock, Package, Calendar, DollarSign } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#0B1426] to-[#1A1F2C]">
      {/* Navigation Header */}
      <div className="sticky top-0 z-50 bg-cosmic-dark/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/10 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Button>
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/81b3af56-15f1-4535-8e61-b2a94a4afd4e.png" 
                alt="PLUGG'IN Logo" 
                className="h-8 w-auto"
              />
              <span className="text-white font-bold text-lg">PLUGG'IN</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Account Management</h1>
            <p className="text-white/60">Manage your profile and view your order history</p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-[400px,1fr]">
            {/* Profile Section */}
            <div className="space-y-6">
              <Card className="bg-cosmic-dark/50 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/80">Email Address</Label>
                    <Input 
                      id="email" 
                      value={email} 
                      disabled 
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white/80">Username</Label>
                    <Input 
                      id="username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="Enter your username"
                    />
                  </div>

                  <Button 
                    onClick={updateProfile}
                    className="w-full bg-white text-black hover:bg-gray-100 font-semibold"
                  >
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-cosmic-dark/50 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/80">New Password</Label>
                    <Input 
                      id="password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="Enter new password"
                    />
                  </div>
                  <Button 
                    onClick={updatePassword}
                    className="w-full bg-white text-black hover:bg-gray-100 font-semibold"
                    disabled={!newPassword}
                  >
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Orders Section */}
            <Card className="bg-cosmic-dark/50 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Order History
                  <span className="ml-auto text-sm font-normal text-white/60">
                    {orders.length} total orders
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-4 mb-6 bg-white/10">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-black">
                      All Orders
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-black">
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:text-black">
                      Completed
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="data-[state=active]:bg-white data-[state=active]:text-black">
                      Cancelled
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value={activeTab} className="mt-0">
                    {filteredOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60 text-lg mb-2">No orders found</p>
                        <p className="text-white/40 text-sm">
                          {activeTab === "all" ? "You haven't placed any orders yet." : `No ${activeTab} orders found.`}
                        </p>
                        <Button
                          onClick={() => navigate("/")}
                          className="mt-4 bg-white text-black hover:bg-gray-100"
                        >
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-white/40"></div>
                                <span className="text-white font-semibold">Order #{order.id}</span>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                  order.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                  'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-white/60 text-sm">
                                <Calendar className="h-4 w-4" />
                                {new Date(order.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-white/60 text-sm mb-1">Product</p>
                                <p className="text-white font-medium">{order.products.name}</p>
                              </div>
                              <div>
                                <p className="text-white/60 text-sm mb-1">Quantity</p>
                                <p className="text-white font-medium">{order.quantity} item{order.quantity > 1 ? 's' : ''}</p>
                              </div>
                              <div>
                                <p className="text-white/60 text-sm mb-1">Total</p>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4 text-white/60" />
                                  <p className="text-white font-bold">{order.total_price.toLocaleString()} RWF</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SalesChart from "@/components/SalesChart";

interface Order {
  id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  customer_name: string;
  status: string;
  created_at: string;
  products: {
    name: string;
  };
}

const Admin = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products!orders_product_id_fkey (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } else {
      setOrders(data as Order[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          price: parseFloat(price),
          image,
        },
      ]);

    if (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      setName("");
      setPrice("");
      setImage("");
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-dark p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        
        <div className="grid gap-8">
          {/* Sales Chart */}
          <div className="bg-cosmic-dark/50 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <h2 className="text-xl text-white mb-4">Sales Overview</h2>
            <SalesChart />
          </div>

          <div className="bg-cosmic-dark/50 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <h2 className="text-xl text-white mb-4">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white block mb-2">Product Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/10 text-white border-white/20"
                  required
                />
              </div>
              <div>
                <label className="text-white block mb-2">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-white/10 text-white border-white/20"
                  required
                />
              </div>
              <div>
                <label className="text-white block mb-2">Image URL</label>
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="bg-white/10 text-white border-white/20"
                  required
                />
              </div>
              <Button 
                type="submit"
                className="w-full bg-white text-cosmic-dark hover:bg-cosmic-light"
              >
                Add Product
              </Button>
            </form>
          </div>

          <div className="bg-cosmic-dark/50 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <h2 className="text-xl text-white mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Order ID</TableHead>
                    <TableHead className="text-white">Product</TableHead>
                    <TableHead className="text-white">Customer</TableHead>
                    <TableHead className="text-white">Quantity</TableHead>
                    <TableHead className="text-white">Total</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-white">#{order.id}</TableCell>
                      <TableCell className="text-white">{order.products?.name}</TableCell>
                      <TableCell className="text-white">{order.customer_name}</TableCell>
                      <TableCell className="text-white">{order.quantity}</TableCell>
                      <TableCell className="text-white">${order.total_price}</TableCell>
                      <TableCell className="text-white capitalize">{order.status}</TableCell>
                      <TableCell className="text-white">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
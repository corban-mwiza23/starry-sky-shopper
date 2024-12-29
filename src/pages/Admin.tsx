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
import { Card } from "@/components/ui/card";

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
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sales Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline">Day</Button>
            <Button variant="outline">Week</Button>
            <Button variant="outline">Month</Button>
          </div>
        </div>
        
        <div className="grid gap-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 shadow-sm">
              <h3 className="text-sm text-muted-foreground mb-2">Total Revenue</h3>
              <p className="text-2xl font-bold">$203,378</p>
              <span className="text-sm text-green-500">+6.32%</span>
            </Card>
            <Card className="p-6 shadow-sm">
              <h3 className="text-sm text-muted-foreground mb-2">Total Orders</h3>
              <p className="text-2xl font-bold">54,544</p>
              <span className="text-sm text-red-500">-3.54%</span>
            </Card>
            <Card className="p-6 shadow-sm">
              <h3 className="text-sm text-muted-foreground mb-2">Total Profit</h3>
              <p className="text-2xl font-bold">$333,653</p>
              <span className="text-sm text-green-500">+4.12%</span>
            </Card>
          </div>

          {/* Sales Chart */}
          <Card className="p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Sales Overview</h2>
            <SalesChart />
          </Card>

          {/* Add Product Form */}
          <Card className="p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Product Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-background"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Image URL</label>
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="bg-background"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Add Product
              </Button>
            </form>
          </Card>

          {/* Recent Orders */}
          <Card className="shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.products?.name}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>${order.total_price}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
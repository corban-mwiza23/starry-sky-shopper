import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import SalesChart from "@/components/SalesChart";
import StatsCard from "@/components/admin/StatsCard";
import OrdersTable from "@/components/admin/OrdersTable";

const Admin = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProfit: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    profitGrowth: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch current month's data
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      console.log('Date range:', {
        firstDayOfMonth: firstDayOfMonth.toISOString(),
        lastDayOfMonth: lastDayOfMonth.toISOString()
      });

      const { data: currentMonthData, error: currentError } = await supabase
        .from('orders')
        .select('total_price, created_at')
        .gte('created_at', firstDayOfMonth.toISOString())
        .lte('created_at', lastDayOfMonth.toISOString());

      // Fetch previous month's data
      const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59);

      const { data: lastMonthData, error: lastError } = await supabase
        .from('orders')
        .select('total_price, created_at')
        .gte('created_at', firstDayOfLastMonth.toISOString())
        .lte('created_at', lastDayOfLastMonth.toISOString());

      if (currentError || lastError) {
        console.error('Error fetching stats:', currentError || lastError);
        return;
      }

      const currentRevenue = currentMonthData?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
      const lastRevenue = lastMonthData?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
      const revenueGrowth = lastRevenue ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

      const currentOrders = currentMonthData?.length || 0;
      const lastOrders = lastMonthData?.length || 0;
      const ordersGrowth = lastOrders ? ((currentOrders - lastOrders) / lastOrders) * 100 : 0;

      // Assuming 30% profit margin for demonstration
      const currentProfit = currentRevenue * 0.3;
      const lastProfit = lastRevenue * 0.3;
      const profitGrowth = lastProfit ? ((currentProfit - lastProfit) / lastProfit) * 100 : 0;

      setStats({
        totalRevenue: currentRevenue,
        totalOrders: currentOrders,
        totalProfit: currentProfit,
        revenueGrowth,
        ordersGrowth,
        profitGrowth
      });
    };

    fetchStats();

    // Set up real-time subscription for stats updates
    const subscription = supabase
      .channel('orders_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchStats)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
            <StatsCard
              title="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              trend={{ value: Number(stats.revenueGrowth.toFixed(2)), isPositive: stats.revenueGrowth > 0 }}
            />
            <StatsCard
              title="Total Orders"
              value={stats.totalOrders}
              trend={{ value: Number(stats.ordersGrowth.toFixed(2)), isPositive: stats.ordersGrowth > 0 }}
            />
            <StatsCard
              title="Total Profit"
              value={`$${stats.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              trend={{ value: Number(stats.profitGrowth.toFixed(2)), isPositive: stats.profitGrowth > 0 }}
            />
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
            <OrdersTable />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
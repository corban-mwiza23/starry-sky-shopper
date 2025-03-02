
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import SalesChart from "@/components/SalesChart";
import StatsCard from "@/components/admin/StatsCard";
import OrdersTable from "@/components/admin/OrdersTable";
import ProductManagement from "@/components/admin/ProductManagement";
import { Order } from "@/types/supabase";

const Admin = () => {
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

      const typedCurrentData = currentMonthData as Pick<Order, 'total_price' | 'created_at'>[];
      const typedLastData = lastMonthData as Pick<Order, 'total_price' | 'created_at'>[];

      const currentRevenue = typedCurrentData?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
      const lastRevenue = typedLastData?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
      const revenueGrowth = lastRevenue ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

      const currentOrders = typedCurrentData?.length || 0;
      const lastOrders = typedLastData?.length || 0;
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Sales Dashboard</h1>
        
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

          {/* Product Management */}
          <ProductManagement />

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

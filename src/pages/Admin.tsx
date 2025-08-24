
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SalesChart from "@/components/SalesChart";
import StatsCard from "@/components/admin/StatsCard";
import OrdersTable from "@/components/admin/OrdersTable";
import ProductManagement from "@/components/admin/ProductManagement";
import { Order } from "@/types/supabase";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const ADMIN_EMAILS = ["corbanmwiza@gmail.com", "jeanlucniyonsaba46@gmail.com"];

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProfit: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    profitGrowth: 0
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !ADMIN_EMAILS.includes(session.user.email || "")) {
        navigate("/admin-auth");
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session || !ADMIN_EMAILS.includes(session.user.email || "")) {
          navigate("/admin-auth");
          return;
        }
        setUser(session.user);
        setLoading(false);
      }
    );

    checkAuth();

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-auth");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/81b3af56-15f1-4535-8e61-b2a94a4afd4e.png" 
              alt="PLUGG'IN Logo" 
              className="h-20 w-auto"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-8 text-center">Sales Dashboard</h1>
        
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

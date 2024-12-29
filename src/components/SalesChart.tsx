import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

interface SalesData {
  date: string;
  total: number;
}

const SalesChart = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('created_at, total_price')
          .order('created_at');

        if (error) {
          console.error('Error fetching sales data:', error);
          return;
        }

        // Group sales by date
        const groupedSales = data.reduce((acc: Record<string, number>, order) => {
          const date = format(new Date(order.created_at!), 'MMM d');
          acc[date] = (acc[date] || 0) + Number(order.total_price);
          return acc;
        }, {});

        // Convert to array format for Recharts
        const formattedData = Object.entries(groupedSales).map(([date, total]) => ({
          date,
          total,
        }));

        setSalesData(formattedData);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[300px] bg-cosmic-dark/30 animate-pulse rounded-lg" />
    );
  }

  return (
    <ChartContainer
      className="aspect-[2/1]"
      config={{
        sales: {
          theme: {
            light: "hsl(var(--primary))",
            dark: "hsl(var(--primary))",
          },
        },
      }}
    >
      <AreaChart data={salesData}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <ChartTooltip>
          <ChartTooltipContent />
        </ChartTooltip>
        <Area
          type="monotone"
          dataKey="total"
          stroke="hsl(var(--primary))"
          fill="url(#salesGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
};

export default SalesChart;
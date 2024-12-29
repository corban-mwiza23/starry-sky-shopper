import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, trend }: StatsCardProps) => {
  return (
    <Card className="p-6 shadow-sm">
      <h3 className="text-sm text-muted-foreground mb-2">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {trend && (
        <span className={`text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {trend.isPositive ? '+' : ''}{trend.value}%
        </span>
      )}
    </Card>
  );
};

export default StatsCard;
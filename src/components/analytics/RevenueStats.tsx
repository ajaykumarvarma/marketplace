import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  uniqueBuyers: number;
  revenueChange: number;
  ordersChange: number;
}

interface RevenueStatsProps {
  stats: Stats;
}

export function RevenueStats({ stats }: RevenueStatsProps) {
  const cards = [
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: DollarSign,
    },
    {
      label: "Orders",
      value: stats.totalOrders.toLocaleString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
    },
    {
      label: "Products Sold",
      value: stats.totalProducts.toLocaleString(),
      change: 0,
      icon: Package,
    },
    {
      label: "Unique Buyers",
      value: stats.uniqueBuyers.toLocaleString(),
      change: 0,
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-foreground/70">{card.label}</p>
            <card.icon className="h-4 w-4 text-primary" />
          </div>
          <p className="font-mono text-2xl font-bold text-foreground">{card.value}</p>
          {card.change !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${card.change > 0 ? "text-success" : "text-destructive"}`}>
              {card.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(card.change)}% vs last period
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
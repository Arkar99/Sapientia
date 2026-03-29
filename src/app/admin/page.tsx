import { kv } from '@vercel/kv';
import { StatCard } from "@/components/admin/StatCard";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { formatTHB } from "@/lib/ai/gemini";

export const metadata = {
  title: "Admin Dashboard | Sapientia",
  description: "Sales and Inventory analytics for Sapientia Camera Store.",
};

export default async function AdminDashboardPage() {
  const orders = (await kv.get<any[]>('orders')) || []; // eslint-disable-line @typescript-eslint/no-explicit-any

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const isCurrentMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  const activeOrders = orders.filter((o) => o.status !== "Canceled");
  const monthlyActiveOrders = activeOrders.filter((o) => isCurrentMonth(o.orderDate));

  const monthlyRevenue = monthlyActiveOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const monthlyOrders = monthlyActiveOrders.length;
  const lifetimeSales = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">Real-time performance tracking for Sapientia</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Revenue (This Month)" 
          value={formatTHB(monthlyRevenue)}
          trend="12.4%" 
          trendType="up"
          iconName="dollar"
          color="primary"
        />
        <StatCard 
          label="Total Orders (This Month)" 
          value={monthlyOrders.toString()}
          trend="8.1%" 
          trendType="up"
          iconName="bag"
          color="blue-500"
        />
        <StatCard 
          label="Lifetime Sales" 
          value={formatTHB(lifetimeSales)}
          iconName="card"
          color="amber-500"
        />
      </div>

      {/* Analytics Charts */}
      <DashboardCharts orders={orders} />

      {/* Recent Orders Table */}
      <div className="pb-10">
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}

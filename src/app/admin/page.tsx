import fs from 'fs';
import path from 'path';
import { StatCard } from "@/components/admin/StatCard";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const metadata = {
  title: "Admin Dashboard | Sapientia",
  description: "Sales and Inventory analytics for Sapientia Camera Store.",
};

export default function AdminDashboardPage() {
  const ordersPath = path.join(process.cwd(), "src/data/orders.json");
  const orders = fs.existsSync(ordersPath) 
    ? JSON.parse(fs.readFileSync(ordersPath, "utf-8")) 
    : [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 1. Calculate Monthly Revenue
  const monthlyRevenue = orders
    .filter((o: any) => {
      const d = new Date(o.orderDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && o.status !== "Canceled";
    })
    .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  // 2. Calculate Monthly Orders
  const monthlyOrders = orders.filter((o: any) => {
    const d = new Date(o.orderDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && o.status !== "Canceled";
  }).length;

  // 3. Calculate Lifetime Sales
  const lifetimeSales = orders
    .filter((o: any) => o.status !== "Canceled")
    .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  const formatTHB = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
  };

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

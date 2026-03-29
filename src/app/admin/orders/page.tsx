import { kv } from '@vercel/kv';
import { OrdersTable } from "@/components/admin/OrdersTable";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Order History | Sapientia Admin",
  description: "Complete list of customer orders for Sapientia Camera Store.",
};

export default async function AdminOrdersHistoryPage() {
  const orders = (await kv.get<any[]>('orders')) || [];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>
        
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Order History</h2>
          <p className="text-muted-foreground mt-1">
            Viewing {orders.length} total orders recorded in the system.
          </p>
        </div>
      </div>

      {/* Full Orders Table */}
      <OrdersTable orders={orders} isFullView={true} />
    </div>
  );
}

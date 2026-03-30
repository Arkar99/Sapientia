"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatTHB } from "@/lib/ai/gemini";

interface Items {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  orderId: string;
  customerName: string;
  orderDate: string;
  items: Items[];
  totalAmount: number;
  status: "Processing" | "Shipped" | "Delivered" | "Canceled";
}

interface OrdersTableProps {
  orders: Order[];
  isFullView?: boolean;
}

export function OrdersTable({ orders, isFullView = false }: OrdersTableProps) {

  const truncate = (text: string, length: number) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Shipped': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Canceled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted/50 text-muted-foreground';
    }
  };

  const itemsToShow = isFullView ? orders : orders.slice(0, 10);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isFullView ? "All Orders History" : "Recent Orders"}
        </h3>
        {!isFullView && (
          <Link 
            href="/admin/orders" 
            className="text-xs font-medium text-primary hover:underline transition-all"
          >
            View All History
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {itemsToShow.map((order) => (
              <tr key={order.orderId} className="hover:bg-muted/10 transition-colors group">
                <td className="px-6 py-4 font-mono text-xs">{order.orderId}</td>
                <td className="px-6 py-4 font-medium">{order.customerName}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  <span title={order.items.map(i => i.productName).join(', ')}>
                    {truncate(order.items.map(i => i.productName).join(', '), 30)}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs">
                  {new Date(order.orderDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-6 py-4 font-semibold text-primary">
                  {formatTHB(order.totalAmount)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {itemsToShow.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/5">
          <p>No orders found yet.</p>
        </div>
      )}
    </motion.div>
  );
}

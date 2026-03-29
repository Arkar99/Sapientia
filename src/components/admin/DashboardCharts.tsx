"use client";

import { useState, useMemo } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend 
} from "recharts";
import { motion } from "framer-motion";

interface Order {
  orderDate: string;
  totalAmount: number;
}

interface DashboardChartsProps {
  orders: any[];
}

export function DashboardCharts({ orders }: DashboardChartsProps) {
  const [timeFilter, setTimeFilter] = useState<"week" | "month">("month");

  // Process data for charts
  const chartData = useMemo(() => {
    const now = new Date();
    const days = timeFilter === "week" ? 7 : 30;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(o => o.orderDate.startsWith(dateStr));
      const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const orderCount = dayOrders.length;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue,
        orders: orderCount,
        fullDate: dateStr
      });
    }
    return data;
  }, [orders, timeFilter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Revenue Line Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border p-6 rounded-xl shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <p className="text-sm text-muted-foreground">Trend of incoming sales</p>
          </div>
          <div className="flex bg-muted rounded-lg p-1">
            <button 
              onClick={() => setTimeFilter("week")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeFilter === "week" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
            >
              Week
            </button>
            <button 
              onClick={() => setTimeFilter("month")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeFilter === "month" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                tickFormatter={(val) => `฿${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--primary)" 
                strokeWidth={3} 
                dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--card)' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Orders Bar Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border p-6 rounded-xl shadow-sm"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold">Total Orders</h3>
            <p className="text-sm text-muted-foreground">Volume of successful transactions</p>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="orders" 
                fill="var(--primary)" 
                radius={[4, 4, 0, 0]}
                barSize={timeFilter === "week" ? 40 : 15}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

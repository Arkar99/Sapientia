"use client";

import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, CreditCard, TrendingUp, LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  dollar: DollarSign,
  bag: ShoppingBag,
  card: CreditCard,
  trending: TrendingUp
};

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendType?: "up" | "down";
  iconName: "dollar" | "bag" | "card" | "trending";
  color?: string;
}

export function StatCard({ label, value, trend, trendType, iconName, color = "primary" }: StatCardProps) {
  const Icon = ICON_MAP[iconName] || DollarSign;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border p-6 rounded-xl hover:shadow-xl hover:shadow-primary/5 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          
          {trend && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
              trendType === "up" ? "text-green-500" : "text-red-500"
            }`}>
              {trendType === "up" ? "↑" : "↓"} {trend}
              <span className="text-muted-foreground font-normal ml-1">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg bg-${color}/10 border border-${color}/20 group-hover:scale-110 transition-transform`}>
          <Icon className={`h-5 w-5 text-${color}`} />
        </div>
      </div>
    </motion.div>
  );
}

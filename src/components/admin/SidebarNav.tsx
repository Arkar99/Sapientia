"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, BrainCircuit } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/admin", exact: true },
    { icon: <BrainCircuit size={20} />, label: "AI Analytics", href: "/admin/ai-analytics" },
    { icon: <Package size={20} />, label: "Inventory", href: "/admin/inventory" },
  ];

  return (
    <nav className="flex-1 space-y-1">
      {links.map((link, idx) => {
        // If href is "#", it's a placeholder, never active
        if (link.href === "#") {
           return (
             <Link 
              key={idx}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {link.icon}
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
           )
        }

        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link 
            key={idx}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {link.icon}
            <span className="text-sm font-medium">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

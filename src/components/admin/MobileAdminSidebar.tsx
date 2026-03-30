"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Camera, LogOut } from "lucide-react";
import { SidebarNav } from "@/components/admin/SidebarNav";

interface MobileAdminSidebarProps {
  userFirstName: string | null;
  userImageUrl?: string | null;
}

export function MobileAdminSidebar({ userFirstName, userImageUrl }: MobileAdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button — shown in the header on small screens */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col py-8 px-4 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tighter">Sapientia Admin</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav wrapped to close drawer on link click */}
        <div onClick={() => setIsOpen(false)} className="flex-1">
          <SidebarNav />
        </div>

        {/* Sign Out */}
        <div className="pt-4 border-t border-border mt-auto">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sign Out</span>
          </Link>
        </div>
      </div>
    </>
  );
}

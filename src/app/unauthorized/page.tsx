"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-card border border-border rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl opacity-50" />

        <div className="relative">
          <div className="mx-auto w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>

          <h1 className="text-3xl font-bold tracking-tighter mb-3">Access Denied</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            You do not have the required administrative privileges to access the Sapientia Management Console. 
            If you believe this is an error, please contact the system administrator.
          </p>

          <div className="grid grid-cols-1 gap-3">
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <ArrowLeft size={18} />
              Back to Storefront
            </Link>
            
            <SignOutButton>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-muted text-muted-foreground font-semibold hover:bg-muted/80 transition-all w-full">
                <LogOut size={18} />
                <span>Sign Out & Switch Account</span>
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { Search, ShoppingCart, Globe, Menu, LayoutDashboard } from "lucide-react";
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLanguage } from "@/lib/LanguageContext";

const ADMIN_EMAILS = [
  "arkar.p67@rsu.ac.th",
  "nayzar.a66@rsu.ac.th",
  "ye.z67@rsu.ac.th",
];

export function Navbar() {
  const { userId } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = 
    user?.publicMetadata?.role === "admin" || 
    (user?.emailAddresses?.[0]?.emailAddress && ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress));

  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === 'dark' ? '/logo-light.png' : '/logo-dark.png';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border background-blur bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-foreground/80 hover:text-foreground transition-colors">
            <Menu className="h-6 w-6" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            {!mounted ? (
              <span className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Sapientia
              </span>
            ) : (
              <>
                <Image
                  src={logoSrc}
                  alt="Sapientia Logo"
                  width={90}
                  height={24}
                  className="h-6 w-auto object-contain"
                  priority
                />
                <span className="sr-only">Sapientia</span>
              </>
            )}
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
          <div className="relative w-full overflow-hidden rounded-full border border-border/50 bg-muted/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t("nav.search")}
              className="w-full bg-transparent py-2 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <LanguageToggle />
          
          <button className="relative p-2 text-foreground/80 hover:text-foreground transition-colors rounded-full hover:bg-muted/50">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
              3
            </span>
          </button>

          <div className="pl-2 border-l border-border h-6 flex items-center gap-2">
            {isAdmin && (
              <Link 
                href="/admin" 
                className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-all px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
            )}

            {!userId ? (
              <div className="text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center [&>button]:!bg-transparent [&>button]:!p-0 [&>button]:!font-inherit [&>button]:!w-full [&>button]:!h-full cursor-pointer">
                <SignInButton mode="modal">
                  {t("nav.signin")}
                </SignInButton>
              </div>
            ) : (
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8 ring-2 ring-primary/20"
                  }
                }}
              />
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}

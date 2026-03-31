"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { Search, ShoppingCart, Menu, X, LayoutDashboard } from "lucide-react";
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { useLanguage } from "@/lib/LanguageContext";
import { ADMIN_EMAILS } from "@/lib/config";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const { userId } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer on route change / resize to desktop
  React.useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setIsMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    (user?.emailAddresses?.[0]?.emailAddress &&
      ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress));

  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === "dark" ? "/logo-light.png" : "/logo-dark.png";

  const NavLinks = () => (
    <>
      <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-foreground/80 hover:text-foreground font-medium transition-colors py-2 border-b border-border/40">
        Home
      </Link>
      <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="text-foreground/80 hover:text-foreground font-medium transition-colors py-2 border-b border-border/40">
        Shop
      </Link>
      <Link href="/blog" onClick={() => setIsMenuOpen(false)} className="text-foreground/80 hover:text-foreground font-medium transition-colors py-2 border-b border-border/40">
        Blog
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          onClick={() => setIsMenuOpen(false)}
          className="flex items-center gap-2 text-primary font-bold py-2 border-b border-border/40"
        >
          <LayoutDashboard size={16} />
          Admin Dashboard
        </Link>
      )}
    </>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">

          {/* Left: Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
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

          {/* Center: Search Bar (desktop only) */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <form onSubmit={handleSearch} className="relative w-full overflow-hidden rounded-full border border-border/50 bg-muted/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("nav.search")}
                className="w-full bg-transparent py-2 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground"
              />
            </form>
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
                      userButtonAvatarBox: "h-8 w-8 ring-2 ring-primary/20",
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border flex-shrink-0">
          {!mounted ? (
            <span className="font-bold text-lg">Sapientia</span>
          ) : (
            <Image src={logoSrc} alt="Sapientia Logo" width={80} height={22} className="h-5 w-auto" />
          )}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-md text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="px-4 py-3 border-b border-border/50">
          <form onSubmit={handleSearch} className="relative w-full overflow-hidden rounded-full border border-border/50 bg-muted/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("nav.search")}
              className="w-full bg-transparent py-2 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground"
            />
          </form>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 flex flex-col overflow-y-auto">
          <NavLinks />
        </nav>

        {/* Auth Footer */}
        <div className="px-4 py-4 border-t border-border">
          {!userId ? (
            <div className="w-full text-sm font-medium bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-center hover:bg-primary/90 transition-all shadow-sm [&>button]:!bg-transparent [&>button]:!p-0 [&>button]:!font-inherit [&>button]:!w-full cursor-pointer">
              <SignInButton mode="modal">{t("nav.signin")}</SignInButton>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <UserButton appearance={{ elements: { userButtonAvatarBox: "h-9 w-9 ring-2 ring-primary/20" } }} />
              <span className="text-sm font-medium text-foreground">{user?.firstName || "Account"}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

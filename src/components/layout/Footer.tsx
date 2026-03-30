"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { Camera, Mail, MessageCircle, Share2, Globe } from "lucide-react";
import { useTheme } from "next-themes";

export function Footer() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = resolvedTheme || theme;
  const logoSrc = currentTheme === 'dark' ? '/logo-light.png' : '/logo-dark.png';

  return (
    <footer className="bg-muted/30 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          <div className="space-y-4">
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
                  />
                  <span className="sr-only">Sapientia</span>
                </>
              )}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Your premium destination for professional photography gear. We provide cutting-edge cameras, lenses, and expert advice powered by AI.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[Mail, MessageCircle, Share2, Globe].map((Icon, i) => (
                <a key={i} href="#" className="h-8 w-8 flex items-center justify-center rounded-full bg-background border border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Shop Categories</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {['Mirrorless Cameras', 'DSLR Cameras', 'Lenses & Filters', 'Lighting & Studio', 'Bags & Cases'].map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Customer Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {['Contact Us', 'Shipping & Returns', 'Trade-In Program', 'Financing', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link href="#" className="hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to receive the latest gear news, reviews, and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button className="h-9 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
          
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Sapientia Camera Store. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { Heart, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  isNew?: boolean;
};

interface ProductScrollerProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
  translationKey?: string;
}

export function ProductScroller({ title, products, viewAllLink = "#", translationKey }: ProductScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const formatTHB = (amount: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="py-8 border-t border-border/50" id={translationKey || title.split(" ")[0].toLowerCase()}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{translationKey ? t(translationKey) : title}</h2>
        <div className="flex items-center gap-4">
          <Link href={viewAllLink} className="text-sm font-medium text-primary hover:underline hidden md:block">
            {t("section.view_all")}
          </Link>
          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => scroll("left")}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              &larr;
            </button>
            <button 
              onClick={() => scroll("right")}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div 
            key={product.id}
            className="group relative min-w-[240px] md:min-w-[280px] rounded-2xl bg-card border border-border/40 p-4 transition-all hover:border-border/80 hover:shadow-xl snap-start flex-shrink-0"
          >
            {product.isNew && (
              <div className="absolute top-4 left-4 z-10 bg-accent-sapientia text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                New
              </div>
            )}
            
            <button className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur backdrop-saturate-150 flex items-center justify-center border border-border/50 text-muted-foreground hover:text-red-500 hover:bg-red-50/50 transition-all opacity-0 group-hover:opacity-100">
              <Heart className="h-4 w-4" />
            </button>
            
            <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center p-4">
              {/* Using CSS background to simulate an image placeholder to avoid broken imgs */}
              <div 
                className="w-full h-full bg-contain bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${product.image})` }}
              />
            </div>
 
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-accent-sapientia text-accent-sapientia" />
                <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
                <span>({product.reviews})</span>
              </div>
              
              <Link href={`/product/${product.id}`} className="block">
                <h3 className="font-semibold text-foreground leading-tight line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-end gap-2">
                  <span className="text-lg font-bold text-foreground">
                    {formatTHB(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through mb-0.5">
                      {formatTHB(product.originalPrice)}
                    </span>
                  )}
                </div>
                
                <button className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                  <ShoppingBag className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

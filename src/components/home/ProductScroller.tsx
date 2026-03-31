"use client";

import { ProductCard, Product } from "@/components/ui/ProductCard";
import { useRef } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";

interface ProductScrollerProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
  translationKey?: string;
}

export function ProductScroller({ title, products, viewAllLink = "#", translationKey }: ProductScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

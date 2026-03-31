"use client";

import { Heart, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useLanguage();

  const formatTHB = (amount: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);

  return (
    <div 
      className="group relative min-w-[240px] md:min-w-[280px] rounded-2xl bg-card border border-border/40 p-4 transition-all hover:border-border/80 hover:shadow-xl snap-start flex-shrink-0"
    >
      {/* Whole Card Link Overlay */}
      <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`} />

      {product.isNew && (
        <div className="absolute top-4 left-4 z-20 bg-accent-sapientia text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
          New
        </div>
      )}
      
      <button className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur backdrop-saturate-150 flex items-center justify-center border border-border/50 text-muted-foreground hover:text-red-500 hover:bg-red-50/50 transition-all opacity-0 group-hover:opacity-100">
        <Heart className="h-4 w-4" />
      </button>
      
      <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center p-4">
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
        
        <h3 className="font-semibold text-foreground leading-tight line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
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
          
          <button className="relative z-20 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

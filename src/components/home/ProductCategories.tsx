"use client";

import { Camera, Aperture, Video, Zap, Scan, Backpack } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

export function ProductCategories() {
  const { t } = useLanguage();

  const categories = [
    { name: t("cat.mirrorless"), icon: Camera, count: 124, key: "mirrorless" },
    { name: t("cat.dslr"), icon: Aperture, count: 86, key: "dslr" },
    { name: t("cat.action"), icon: Video, count: 42, key: "action" },
    { name: t("cat.lenses"), icon: Scan, count: 315, key: "lenses" },
    { name: t("cat.lighting"), icon: Zap, count: 189, key: "lighting" },
    { name: t("cat.acc"), icon: Backpack, count: 540, key: "acc" },
  ];

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight">{t("cat.title")}</h2>
        <Link href="#" className="hidden md:block text-sm font-medium text-primary hover:underline">
          {t("cat.all")}
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.key}
            href={`#${category.key}`}
            className="group flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/80 hover:border-border hover:shadow-md transition-all duration-300"
          >
            <div className="h-16 w-16 mb-4 rounded-full bg-background flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
              <category.icon className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-center">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {category.count} {t("cat.products")}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

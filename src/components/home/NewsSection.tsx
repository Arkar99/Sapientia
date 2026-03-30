"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

const articles = [
  {
    id: 1,
    category: "Review",
    title: "Sony Alpha 9 III: The Global Shutter Revolution",
    date: "March 24, 2026",
    image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=800&auto=format&fit=crop",
    readTime: "8 min read"
  },
  {
    id: 2,
    category: "Tutorial",
    title: "Mastering Cinematic Lighting for Beginners",
    date: "March 20, 2026",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800&auto=format&fit=crop",
    readTime: "12 min read"
  },
  {
    id: 3,
    category: "News",
    title: "Canon Teases New RF 35mm f/1.2 L Lens",
    date: "March 18, 2026",
    image: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=800&auto=format&fit=crop",
    readTime: "4 min read"
  }
];

export function NewsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 border-t border-border/50">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">{t("news.title")}</h2>
          <p className="text-muted-foreground">{t("news.desc")}</p>
        </div>
        <Link href="/blog" className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group">
          Go to Blog
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((article, i) => (
          <article key={article.id} className="group cursor-pointer">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl mb-4 bg-muted">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${article.image})` }}
              />
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-foreground">
                {article.category}
              </div>
            </div>
            
            <div className="space-y-3 pr-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.date}
                </span>
                <span>•</span>
                <span>{article.readTime}</span>
              </div>
              
              <h3 className="text-xl font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

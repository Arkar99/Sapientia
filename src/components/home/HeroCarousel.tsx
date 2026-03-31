"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useLanguage } from "@/lib/LanguageContext";

export function HeroCarousel() {
  const { t } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop",
      badge: t("hero.badge"),
      title: t("hero.title"),
      desc: t("hero.desc"),
      btn: t("hero.btn")
    },
    {
      id: 2,
      image: "/carousel/hero-2.png",
      badge: t("hero.slide2.badge"),
      title: t("hero.slide2.title"),
      desc: t("hero.slide2.desc"),
      btn: t("hero.slide2.btn")
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=2000&auto=format&fit=crop",
      badge: t("hero.slide3.badge"),
      title: t("hero.slide3.title"),
      desc: t("hero.slide3.desc"),
      btn: t("hero.slide3.btn")
    }
  ];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  return (
    <section className="relative w-full h-[50vh] min-h-[300px] md:min-h-[400px] overflow-hidden bg-muted rounded-2xl md:rounded-3xl group mt-4">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide) => (
            <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 h-full">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url('${slide.image}')` }}
              ></div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent"></div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 container mx-auto">
                <span className="inline-block w-fit px-3 py-1 bg-accent-sapientia/20 text-accent-sapientia rounded-full text-xs font-semibold tracking-wider mb-3 md:mb-4 animate-in slide-in-from-bottom-5 border border-accent-sapientia/30">
                  {slide.badge}
                </span>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-3 md:mb-4 max-w-2xl leading-tight animate-in slide-in-from-bottom-6">
                  {slide.title}
                </h1>
                <p className="text-sm md:text-lg lg:text-xl text-foreground/80 mb-5 md:mb-8 max-w-xl animate-in slide-in-from-bottom-7 line-clamp-2 md:line-clamp-none">
                  {slide.desc}
                </p>
                <button className="w-fit bg-primary text-primary-foreground px-6 md:px-8 py-3 md:py-4 rounded-full font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-xl animate-in slide-in-from-bottom-8 text-sm md:text-base">
                  {slide.btn}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls — bottom-left on mobile, bottom-right on desktop */}
      <div className="absolute bottom-4 left-4 md:left-auto md:bottom-6 md:right-8 flex gap-2 md:gap-3 z-10">
        <button
          onClick={scrollPrev}
          className="h-9 w-9 md:h-12 md:w-12 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center text-foreground hover:bg-background transition-colors hover:scale-110"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button
          onClick={scrollNext}
          className="h-9 w-9 md:h-12 md:w-12 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center text-foreground hover:bg-background transition-colors hover:scale-110"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>
      
      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10 font-bold">
        {slides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => scrollTo(i)}
            className={`h-2 rounded-full transition-all ${i === selectedIndex ? 'w-8 bg-accent-sapientia' : 'w-2 bg-foreground/30 hover:bg-foreground/50 cursor-pointer'}`} 
          />
        ))}
      </div>
    </section>
  );
}

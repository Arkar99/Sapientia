"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Locale = "en" | "th";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    "nav.search": "Search cameras, lenses, and accessories...",
    "nav.cart": "Cart",
    "nav.en": "EN",
    "nav.th": "TH",
    "nav.signin": "Sign In",
    "hero.badge": "NEW ARRIVAL",
    "hero.title": "Capture the World in Unprecedented Detail",
    "hero.desc": "Discover the new Sapientia Alpha series. High-resolution sensors meet industry-leading autofocus.",
    "hero.btn": "Shop Alpha Series",
    "hero.slide2.badge": "OPTICAL PRECISION",
    "hero.slide2.title": "Elevate Every Shot with G-Master Lenses",
    "hero.slide2.desc": "Uncompromising resolution and bokeh. Explore the world's most advanced optical technology.",
    "hero.slide2.btn": "Explore Lenses",
    "hero.slide3.badge": "COMPACT POWER",
    "hero.slide3.title": "Small Enough for Any Adventure",
    "hero.slide3.desc": "Pro-level video in a pocket-sized body. Perfect for vloggers and travelers on the move.",
    "hero.slide3.btn": "Shop Compacts",
    "chat.header": "Sapientia Guide",
    "chat.greeting": "Hi there! 👋 I'm your Sapientia AI assistant. How can I help you find the perfect camera today?",
    "chat.placeholder": "Ask about specs, models, or stock...",
    "chat.signin_msg": "Sign in to unlock our AI Camera Assistant.",
    "chat.signin_btn": "Sign In to Chat",
    "cat.title": "Shop by Category",
    "cat.all": "View all categories",
    "cat.mirrorless": "Mirrorless",
    "cat.dslr": "DSLR",
    "cat.action": "Action",
    "cat.lenses": "Lenses",
    "cat.lighting": "Lighting",
    "cat.acc": "Accessories",
    "cat.products": "Products",
    "section.new": "New Arrivals",
    "section.best": "Best Sellers",
    "section.top_mirrorless": "Top Mirrorless Cameras",
    "section.top_dslr": "Top DSLR Cameras",
    "section.lenses": "Professional Lenses",
    "section.action": "Action & Cinema",
    "section.view_all": "View all",
    "news.title": "Editor's Picks & News",
    "news.desc": "Expert reviews, tutorials, and the latest from the photography world.",
    "footer.desc": "Your premium destination for professional photography gear. We provide cutting-edge cameras, lenses, and expert advice powered by AI.",
    "footer.shop": "Shop Categories",
    "footer.support": "Customer Support",
    "footer.stay": "Stay Updated",
    "footer.subscribe": "Subscribe",
    "footer.placeholder": "Enter your email",
    "chat.attract_bubble": "Need help? Ask our AI!"
  },
  th: {
    "nav.search": "ค้นหากล้อง เลนส์ และอุปกรณ์เสริม...",
    "nav.cart": "รถเข็น",
    "nav.en": "ภาษาอังกฤษ",
    "nav.th": "ภาษาไทย",
    "nav.signin": "เข้าสู่ระบบ",
    "hero.badge": "สินค้าใหม่",
    "hero.title": "บันทึกโลกในรายละเอียดที่คุณไม่เคยเห็นมาก่อน",
    "hero.desc": "พบกับกล้อง Sapientia ตระกูล Alpha ใหม่ เซนเซอร์ความละเอียดสูงพร้อมระบบออโต้โฟกัสระดับแนวหน้าของอุตสาหกรรม",
    "hero.btn": "เลือกซื้อตระกูล Alpha",
    "hero.slide2.badge": "ความแม่นยำด้านออปติคอล",
    "hero.slide2.title": "ยกระดับทุกช็อตด้วยเลนส์ G-Master",
    "hero.slide2.desc": "ความละเอียดและโบเก้ที่สวยงามแบบไร้ข้อจำกัด ค้นพบเทคโนโลยีเลนส์ที่ล้ำหน้าที่สุดในโลก",
    "hero.slide2.btn": "สำรวจเลนส์ทั้งหมด",
    "hero.slide3.badge": "พลังในขนาดกะทัดรัด",
    "hero.slide3.title": "กะทัดรัด แข็งแกร่ง พร้อมผจญภัย",
    "hero.slide3.desc": "วิดีโอระดับมืออาชีพในตัวเครื่องขนาดพกพา ตอบโจทย์เหล่าครีเอเตอร์และนักเดินทาง",
    "hero.slide3.btn": "เลือกซื้อกล้อง Compact",
    "chat.header": "Sapientia Guide",
    "chat.greeting": "สวัสดีครับ! 👋 ผมคือผู้ช่วย AI ของ Sapientia ให้ผมช่วยคุณเลือกกล้องที่เหมาะที่สุดสำหรับวันนี้ไหมครับ?",
    "chat.placeholder": "ถามเกี่ยวกับสเปก รุ่น หรือเช็คสต็อกสินค้า...",
    "chat.signin_msg": "เข้าสู่ระบบเพื่อใช้งานผู้ช่วยกล้องอัจฉริยะของเรา",
    "chat.signin_btn": "เข้าสู่ระบบเพื่อพูดคุย",
    "cat.title": "เลือกซื้อตามหมวดหมู่",
    "cat.all": "ดูหมวดหมู่ทั้งหมด",
    "cat.mirrorless": "มิเรอร์เลส",
    "cat.dslr": "ดีเอสแอลอาร์",
    "cat.action": "แอ็คชั่น",
    "cat.lenses": "เลนส์",
    "cat.lighting": "อุปกรณ์ไฟ",
    "cat.acc": "อุปกรณ์เสริม",
    "cat.products": "สินค้า",
    "section.new": "สินค้ามาใหม่",
    "section.best": "สินค้าขายดี",
    "section.top_mirrorless": "กล้องมิเรอร์เลสยอดนิยม",
    "section.top_dslr": "กล้อง DSLR ยอดนิยม",
    "section.lenses": "เลนส์ระดับมืออาชีพ",
    "section.action": "แอ็คชั่นและวิดีโอ",
    "section.view_all": "ดูทั้งหมด",
    "news.title": "ข่าวและสาระน่าสนใจจากบรรณาธิการ",
    "news.desc": "รีวิวจากผู้เชี่ยวชาญ บทแนะนำ และข่าวสารล่าสุดจากโลกแห่งการถ่ายภาพ",
    "footer.desc": "จุดหมายระดับพรีเมียมสำหรับอุปกรณ์ถ่ายภาพระดับมืออาชีพของคุณ เราเตรียมกล้อง เลนส์ และคำแนะนำจากผู้เชี่ยวชาญด้วยระบบ AI",
    "footer.shop": "หมวดหมู่สินค้า",
    "footer.support": "สนับสนุนลูกค้า",
    "footer.stay": "ติดตามข่าวสาร",
    "footer.subscribe": "ติดตาม",
    "footer.placeholder": "ใส่อีเมลของคุณ",
    "chat.attract_bubble": "ต้องการความช่วยเหลือ? ถาม AI ของเราสิ!"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  // Load from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("sapientia-locale") as Locale;
    if (savedLocale && (savedLocale === "en" || savedLocale === "th")) {
      setLocale(savedLocale);
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("sapientia-locale", newLocale);
    // Optional: add cookie for server side sync?
    document.cookie = `sapientia-locale=${newLocale}; path=/; max-age=31536000`;
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

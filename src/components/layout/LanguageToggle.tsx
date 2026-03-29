"use client";

import * as React from "react";
import { Globe, Check } from "lucide-react";
import { useLanguage, Locale } from "@/lib/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex items-center gap-1.5 p-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors rounded-full hover:bg-muted/50 outline-none">
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline-block uppercase">{locale}</span>
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-40 p-1">
        <DropdownMenuItem 
          onClick={() => setLocale("en")}
          className="flex items-center justify-between cursor-pointer"
        >
          <span>English</span>
          {locale === "en" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLocale("th")}
          className="flex items-center justify-between cursor-pointer"
        >
          <span>ภาษาไทย</span>
          {locale === "th" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

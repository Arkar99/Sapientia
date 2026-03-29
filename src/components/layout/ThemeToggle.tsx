"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by rendering only after it's mounted
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="relative flex items-center justify-center p-2 text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-full transition-colors h-9 w-9">
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative flex items-center justify-center p-2 text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-full transition-colors h-9 w-9 group"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 absolute transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0 group-hover:text-primary" />
      <Moon className="h-5 w-5 absolute transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100 group-hover:text-primary" />
    </button>
  );
}

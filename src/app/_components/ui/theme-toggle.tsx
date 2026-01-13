"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  // This effect runs only on the client after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return a placeholder during SSR and initial render
  if (!isClient) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
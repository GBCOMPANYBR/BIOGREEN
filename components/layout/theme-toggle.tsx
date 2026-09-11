"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("biogreen-theme", next);
    } catch {
      // localStorage pode estar indisponível (modo privado) — o tema só não persiste entre sessões.
    }
    setIsDark(next === "dark");
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema claro/escuro">
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

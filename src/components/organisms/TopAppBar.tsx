import { Bell, Settings, Moon, Sun } from "lucide-react";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";
import { useEffect, useState } from "react";

export const TopAppBar = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") return true;
      if (saved === "light") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <header className="flex fixed top-10 w-full z-50 justify-between items-center px-6 md:px-12 h-20 md:h-24 pointer-events-none">
      <Typography variant="display" className="flex tracking-tighter pointer-events-auto">
        Echo
      </Typography>
      <div className="flex items-center gap-4 pointer-events-auto">
        <Button variant="default" size="icon" className="text-on-surface-variant" onClick={() => setIsDark(!isDark)}>
          {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
        </Button>
        <Button variant="default" size="icon" className="hidden lg:flex text-on-surface-variant">
          <Bell size={20} strokeWidth={1.5} />
        </Button>
        <Button variant="default" size="icon" className="hidden lg:flex text-on-surface-variant">
          <Settings size={20} strokeWidth={1.5} />
        </Button>
      </div>
    </header>
  );
};

"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    let isDark = true;
    try {
      const stored = window.localStorage.getItem("chaos-theme");
      isDark = stored ? stored === "dark" : true;
    } catch {
      /* 存储不可用时保持暗色 */
    }
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem("chaos-theme", next ? "dark" : "light");
    } catch {
      /* 存储不可用时忽略 */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "切换到亮色模式" : "切换到暗色模式"}
      title={dark ? "亮色模式" : "暗色模式"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border/60 text-parchment/70 transition-colors hover:border-brass/60 hover:text-brass"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

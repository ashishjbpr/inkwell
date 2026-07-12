"use client";

import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Palette, Check } from "lucide-react";

const THEMES = [
  { id: "theme-indigo", label: "Indigo", color: "#6366f1" },
  { id: "theme-ocean", label: "Ocean", color: "#0ea5e9" },
  { id: "theme-emerald", label: "Emerald", color: "#10b981" },
  { id: "theme-rose", label: "Rose", color: "#f43f5e" },
];

export default function ThemeSelector() {
  const [dark, setDark] = useState(false);
  const [theme, setTheme] = useState("theme-indigo");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside handler
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedDark = localStorage.getItem("journal-dark-mode") === "true";
    const storedTheme = localStorage.getItem("journal-color-theme") || "theme-indigo";
    
    setDark(storedDark);
    setTheme(storedTheme);
    applyTheme(storedTheme, storedDark);
  }, []);

  const applyTheme = (newTheme: string, isDark: boolean) => {
    const html = document.documentElement;
    // Remove old themes
    THEMES.forEach(t => html.classList.remove(t.id));
    html.classList.remove("dark");
    
    // Apply new
    if (newTheme !== "theme-indigo") {
      html.classList.add(newTheme);
    }
    if (isDark) {
      html.classList.add("dark");
    }
  };

  const setMode = (isDark: boolean) => {
    if (dark === isDark) return;
    setDark(isDark);
    localStorage.setItem("journal-dark-mode", String(isDark));
    applyTheme(theme, isDark);
  };

  const selectTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("journal-color-theme", newTheme);
    applyTheme(newTheme, dark);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-icon btn-secondary"
        style={{ color: "var(--accent)" }}
        aria-label="Theme settings"
      >
        <Palette size={16} />
      </button>

      {isOpen && (
        <div 
          className="popover-content right-0 mt-2 w-48 p-3 gap-3"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--text-tertiary)" }}>Mode</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setMode(false)}
                className="flex-1 py-1.5 flex justify-center items-center rounded-lg border-2 transition-all"
                style={{
                  borderColor: !dark ? "var(--accent)" : "transparent",
                  backgroundColor: !dark ? "var(--accent-bg)" : "var(--bg-hover)",
                  color: !dark ? "var(--accent-text)" : "var(--text-secondary)"
                }}
              >
                <Sun size={14} />
              </button>
              <button 
                onClick={() => setMode(true)}
                className="flex-1 py-1.5 flex justify-center items-center rounded-lg border-2 transition-all"
                style={{
                  borderColor: dark ? "var(--accent)" : "transparent",
                  backgroundColor: dark ? "var(--accent-bg)" : "var(--bg-hover)",
                  color: dark ? "var(--accent-text)" : "var(--text-secondary)"
                }}
              >
                <Moon size={14} />
              </button>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--text-tertiary)" }}>Color</p>
            <div className="flex flex-col gap-1">
              {THEMES.map(t => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTheme(t.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? "bg-[var(--bg-hover)] text-[var(--text)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: t.color }} />
                      <span className="font-medium">{t.label}</span>
                    </div>
                    {isActive && <Check size={14} style={{ color: "var(--accent)" }} />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

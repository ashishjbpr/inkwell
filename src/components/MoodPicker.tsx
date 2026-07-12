"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Mood, MOODS } from "@/lib/types";
import MoodIcon from "./MoodIcon";

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = value ? MOODS.find((m) => m.value === value) : null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all text-sm"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-card)",
          color: "var(--text)",
        }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
        onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border)"}
      >
        {selected ? (
          <>
            <MoodIcon mood={selected.value} size={18} />
            <span className="font-medium" style={{ color: "var(--text)" }}>{selected.label}</span>
          </>
        ) : (
          <span style={{ color: "var(--text-tertiary)" }}>Mood…</span>
        )}
        <ChevronDown size={14} style={{ color: "var(--text-tertiary)" }} />
      </button>

      {open && (
        <div
          className="absolute top-full mt-1 left-0 z-50 w-48 rounded-2xl border-2 p-2 shadow-xl"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => {
                onChange(mood.value);
                setOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-colors"
              style={{
                backgroundColor: value === mood.value ? "var(--accent-bg)" : "transparent",
                color: value === mood.value ? "var(--accent-text)" : "var(--text-secondary)",
              }}
              onMouseOver={(e) => {
                if (value !== mood.value) {
                  e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                }
              }}
              onMouseOut={(e) => {
                if (value !== mood.value) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <MoodIcon mood={mood.value} size={18} />
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

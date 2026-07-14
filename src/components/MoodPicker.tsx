"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Mood, MOODS } from "@/lib/types";
import MoodIcon from "./MoodIcon";

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
  customMoods?: Mood[];
}

export default function MoodPicker({ value, onChange, customMoods = [] }: MoodPickerProps) {
  const [open, setOpen] = useState(false);
  const [newMood, setNewMood] = useState("");
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

  const builtInValues = new Set(MOODS.map((m) => m.value));
  const selected = value
    ? MOODS.find((m) => m.value === value) ?? { value, label: value, icon: "", color: "" }
    : null;

  function handleSelect(mood: Mood) {
    onChange(mood);
    setOpen(false);
  }

  function handleAddMood() {
    const trimmed = newMood.trim();
    if (!trimmed) return;
    handleSelect(trimmed);
    setNewMood("");
  }

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
          className="absolute top-full mt-1 left-0 z-50 w-52 rounded-2xl border-2 p-2 shadow-xl max-h-80 overflow-y-auto"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleSelect(mood.value)}
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

          {customMoods.filter((m) => !builtInValues.has(m)).length > 0 && (
            <>
              <div
                className="text-xs font-bold uppercase tracking-wider px-3 pt-2 pb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                Your Moods
              </div>
              {customMoods
                .filter((m) => !builtInValues.has(m))
                .map((mood) => (
                  <button
                    key={mood}
                    onClick={() => handleSelect(mood)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-colors"
                    style={{
                      backgroundColor: value === mood ? "var(--accent-bg)" : "transparent",
                      color: value === mood ? "var(--accent-text)" : "var(--text-secondary)",
                    }}
                    onMouseOver={(e) => {
                      if (value !== mood) {
                        e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (value !== mood) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <MoodIcon mood={mood} size={18} />
                    <span>{mood}</span>
                  </button>
                ))}
            </>
          )}

          <div className="border-t mt-2 pt-2" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex items-center gap-1 px-1">
              <input
                value={newMood}
                onChange={(e) => setNewMood(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMood();
                  }
                }}
                placeholder="New mood…"
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-sm outline-none border-2"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                }}
              />
              <button
                onClick={handleAddMood}
                disabled={!newMood.trim()}
                className="btn-icon flex items-center justify-center rounded-lg w-8 h-8 shrink-0 disabled:opacity-40"
                style={{ color: "var(--accent)" }}
                aria-label="Add mood"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

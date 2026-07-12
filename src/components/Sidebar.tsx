"use client";

import { useState, useMemo } from "react";
import { Entry, MOODS, Mood } from "@/lib/types";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import {
  Search,
  Plus,
  FileDown,
  X,
  Menu,
  Flame,
  BookOpen,
} from "lucide-react";
import { getStreak } from "@/lib/storage";
import ThemeToggle from "@/components/ThemeToggle";
import MoodIcon from "@/components/MoodIcon";

interface SidebarProps {
  entries: Entry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onExport: () => void;
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  entries,
  selectedId,
  onSelect,
  onNew,
  onExport,
  open,
  onToggle,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<Mood | "all">("all");
  const streak = getStreak();

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.tags.some((t) => t.includes(q));
      const matchesMood = moodFilter === "all" || e.mood === moodFilter;
      return matchesSearch && matchesMood;
    });
  }, [entries, search, moodFilter]);

  function formatDate(dateStr: string) {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: "rgba(17, 15, 31, 0.4)", backdropFilter: "blur(4px)" }}
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 lg:w-80 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ backgroundColor: "var(--bg-sidebar)", borderRight: "2px solid var(--border)" }}
      >
        {/* Header */}
        <div className="p-4 border-b-2" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
                <BookOpen size={22} style={{ color: "var(--accent)" }} />
                Life Journal
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Your private space</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={onToggle}
                className="w-8 h-8 rounded-xl flex items-center justify-center lg:hidden transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <button
            onClick={onNew}
            className="btn-accent-glow w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            <Plus size={18} />
            New Entry
          </button>
        </div>

        {/* Streak */}
        <div
          className="px-4 py-3 border-b-2 flex items-center gap-2 text-sm"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--streak-bg)",
          }}
        >
          <Flame size={20} style={{ color: "var(--accent)" }} />
          <span className="font-bold" style={{ color: "var(--streak-text)" }}>{streak} day streak</span>
          <span className="text-xs ml-auto" style={{ color: "var(--text-tertiary)" }}>Keep writing!</span>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b-2 space-y-2" style={{ borderColor: "var(--border)" }}>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entries…"
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--bg-card)",
                color: "var(--text)",
                border: "2px solid var(--border)",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
              onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setMoodFilter("all")}
              className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors"
              style={{
                backgroundColor: moodFilter === "all" ? "var(--accent)" : "var(--bg-card)",
                color: moodFilter === "all" ? "#fff" : "var(--text-secondary)",
                borderColor: moodFilter === "all" ? "var(--accent)" : "var(--border)",
              }}
            >
              All
            </button>
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setMoodFilter(mood.value)}
                className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1"
                style={{
                  backgroundColor: moodFilter === mood.value ? "var(--accent)" : "var(--bg-card)",
                  color: moodFilter === mood.value ? "#fff" : "var(--text-secondary)",
                  borderColor: moodFilter === mood.value ? "var(--accent)" : "var(--border)",
                }}
              >
                <MoodIcon mood={mood.value} size={14} />
                {mood.label}
              </button>
            ))}
          </div>
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="text-center py-8 px-4">
              <BookOpen size={36} className="mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {search || moodFilter !== "all"
                  ? "No entries match your search"
                  : "No entries yet. Start writing!"}
              </p>
            </div>
          ) : (
            filtered.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                className="w-full text-left p-3 rounded-2xl border-2 transition-all"
                style={{
                  backgroundColor: selectedId === entry.id ? "var(--bg-card)" : "transparent",
                  borderColor: selectedId === entry.id ? "var(--accent)" : "transparent",
                }}
                onMouseOver={(e) => {
                  if (selectedId !== entry.id) {
                    e.currentTarget.style.backgroundColor = "var(--bg-card)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedId !== entry.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
                    {formatDate(entry.createdAt)}
                  </span>
                  <MoodIcon mood={entry.mood} size={18} />
                </div>
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                  {entry.title || "Untitled"}
                </p>
                <p className="text-xs line-clamp-1 mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {entry.content.replace(/<[^>]*>/g, "").slice(0, 80)}
                </p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                        style={{
                          backgroundColor: "var(--accent-bg)",
                          color: "var(--accent-text)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <FileDown size={16} />
            Export as HTML
          </button>
          <p className="text-[10px] text-center mt-2" style={{ color: "var(--text-tertiary)" }}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"} · 100% private
          </p>
        </div>
      </aside>
    </>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Entry, MOODS, Mood } from "@/lib/types";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import {
  Search,
  Plus,
  FileDown,
  X,
  BookOpen,
  LayoutDashboard,
  Lock,
  Star
} from "lucide-react";
import ThemeSelector from "@/components/ThemeSelector";
import MoodIcon from "@/components/MoodIcon";

interface SidebarProps {
  entries: Entry[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onNew: () => void;
  onExport: () => void;
  open: boolean;
  onToggle: () => void;
  hasPin: boolean;
  onLockApp: () => void;
}

export default function Sidebar({
  entries,
  selectedId,
  onSelect,
  onNew,
  onExport,
  open,
  onToggle,
  hasPin,
  onLockApp
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<Mood | "all">("all");
  const [showFavorites, setShowFavorites] = useState(false);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.content.toLowerCase().includes(q) ||
        e.tags.some((t) => t.includes(q));
      const matchesMood = moodFilter === "all" || e.mood === moodFilter;
      const matchesFavorite = !showFavorites || e.isFavorite;
      return matchesSearch && matchesMood && matchesFavorite;
    });
  }, [entries, search, moodFilter, showFavorites]);

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
            </div>
            <div className="flex items-center gap-2">
              <ThemeSelector />
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

          <div className="flex gap-2">
            <button
              onClick={() => onSelect(null)}
              className={`btn flex-1 ${selectedId === null ? 'btn-secondary' : 'btn-ghost'}`}
              style={selectedId === null ? { borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-bg)' } : {}}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>

            <button
              onClick={onNew}
              className="btn btn-primary flex-1 btn-accent-glow"
            >
              <Plus size={18} />
              New
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b-2 space-y-3" style={{ borderColor: "var(--border)" }}>
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
              className="input-field pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`shrink-0 cursor-pointer ${showFavorites ? 'badge badge-primary' : 'badge'}`}
            >
              <Star size={12} fill={showFavorites ? "currentColor" : "none"} />
              Favorites
            </button>
            <div className="w-px h-4" style={{ backgroundColor: "var(--border)" }} />
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
              <button
                onClick={() => setMoodFilter("all")}
                className={`shrink-0 cursor-pointer ${moodFilter === "all" ? 'badge badge-primary' : 'badge'}`}
              >
                All
              </button>
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setMoodFilter(mood.value)}
                  className={`shrink-0 cursor-pointer ${moodFilter === mood.value ? 'badge badge-primary' : 'badge'}`}
                >
                  <MoodIcon mood={mood.value} size={12} />
                  {mood.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="text-center py-8 px-4">
              <BookOpen size={36} className="mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {search || moodFilter !== "all" || showFavorites
                  ? "No entries match your filters"
                  : "No entries yet. Start writing!"}
              </p>
            </div>
          ) : (
            filtered.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                className={`list-item relative ${selectedId === entry.id ? 'list-item-active' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[var(--text-tertiary)]">
                    {formatDate(entry.createdAt)}
                  </span>
                  <div className={`flex items-center gap-1 ${selectedId === entry.id ? 'text-[var(--accent-text)]' : 'text-[var(--accent)]'}`}>
                    {entry.isFavorite && <Star size={12} fill="currentColor" />}
                    <MoodIcon mood={entry.mood} size={18} />
                  </div>
                </div>
                <p className={`text-sm font-semibold truncate ${selectedId === entry.id ? 'text-[var(--accent-text)]' : 'text-[var(--text)]'}`}>
                  {entry.title || "Untitled"}
                </p>
                <p className={`text-xs line-clamp-1 mt-0.5 opacity-70 ${selectedId === entry.id ? 'text-[var(--accent-text)]' : 'text-[var(--text-secondary)]'}`}>
                  {entry.content.replace(/<[^>]*>/g, "").slice(0, 80)}
                </p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className={`text-[10px] py-0 px-1.5 rounded-full border opacity-80 ${selectedId === entry.id ? 'border-current' : 'border-[var(--accent)] text-[var(--accent)]'}`}
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
        <div className="p-4 border-t-2 space-y-2" style={{ borderColor: "var(--border)" }}>
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="btn btn-secondary flex-1 text-xs py-2"
            >
              <FileDown size={14} />
              Export
            </button>
            <button
              onClick={onLockApp}
              className="btn btn-secondary flex-1 text-xs py-2"
            >
              <Lock size={14} />
              {hasPin ? "Lock App" : "Set PIN"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

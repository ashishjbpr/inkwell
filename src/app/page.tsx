"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Entry } from "@/lib/types";
import { getEntries, createEntry } from "@/lib/storage";
import { BookOpen, Plus, CalendarDays, Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import EntryEditor from "@/components/EntryEditor";
import CalendarView from "@/components/CalendarView";
import YearlyOverview from "@/components/YearlyOverview";
import ThemeToggle from "@/components/ThemeToggle";
import MoodIcon from "@/components/MoodIcon";

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showYearly, setShowYearly] = useState(false);
  const [view, setView] = useState<"calendar" | "editor">("calendar");

  useEffect(() => {
    setEntries(getEntries());
    setIsLoaded(true);
  }, []);

  const dateEntries = useMemo(() => {
    if (!selectedDate) return [];
    return entries.filter((e) => e.createdAt.slice(0, 10) === selectedDate);
  }, [entries, selectedDate]);

  const selectedEntry = selectedId
    ? entries.find((e) => e.id === selectedId) ?? null
    : null;

  function handleNew() {
    const entry = createEntry({
      title: "",
      content: "",
      mood: "thoughtful",
      tags: [],
    });
    setEntries((prev) => [entry, ...prev]);
    setSelectedId(entry.id);
    setSidebarOpen(false);
    setView("editor");
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    setSidebarOpen(false);
    setView("editor");
  }

  function handleSelectDate(date: string | null) {
    setSelectedDate(date);
    setSelectedId(null);
    if (date) {
      const match = entries.find((e) => e.createdAt.slice(0, 10) === date);
      if (match) {
        setSelectedId(match.id);
        setView("editor");
      } else {
        setView("calendar");
      }
    } else {
      setView("calendar");
    }
  }

  const handleDelete = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const handleUpdate = useCallback((updated: Entry) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
  }, []);

  function handleExport() {
    if (entries.length === 0) return;
    const allContent = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>Life Journal Export</title>
        <style>
          @page { margin: 20mm; }
          body { font-family: 'Inter', -apple-system, sans-serif; color: #1e1b2e; line-height: 1.8; max-width: 700px; margin: 0 auto; padding: 40px 20px; }
          h1 { font-size: 32px; margin-bottom: 4px; }
          .subtitle { color: #9d96b8; font-size: 14px; margin-bottom: 40px; }
          .entry { margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid #e2dff0; }
          .entry:last-child { border-bottom: none; }
          .entry-title { font-size: 24px; margin-bottom: 4px; }
          .entry-date { color: #9d96b8; font-size: 13px; margin-bottom: 8px; }
          .entry-mood { font-size: 14px; margin-bottom: 8px; }
          .entry-tags { margin-bottom: 12px; }
          .entry-tag { display: inline-block; padding: 2px 8px; border-radius: 6px; background: #eef0ff; color: #4338ca; font-size: 12px; margin-right: 4px; }
          .entry-content p { margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <h1>Life Journal</h1>
        <p class="subtitle">${entries.length} entries · Exported ${new Date().toLocaleDateString()}</p>
        ${entries
          .map(
            (e) => `
          <div class="entry">
            <h2 class="entry-title">${e.title || "Untitled"}</h2>
            <p class="entry-date">${new Date(e.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            <p class="entry-mood">Mood: ${e.mood}</p>
            ${e.tags.length > 0 ? `<div class="entry-tags">${e.tags.map((t) => `<span class="entry-tag">#${t}</span>`).join(" ")}</div>` : ""}
            <div class="entry-content">${e.content || "<em>Empty entry</em>"}</div>
          </div>
        `
          )
          .join("")}
        <p style="text-align:center;color:#9d96b8;font-size:12px;margin-top:48px;">Made with Life Journal — 100% private, 100% yours.</p>
      </body>
      </html>
    `;

    const blob = new Blob([allContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `life-journal-export-${new Date().toISOString().split("T")[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        handleNew();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <div className="text-center">
          <BookOpen size={64} className="mx-auto mb-4 animate-pulse" style={{ color: "var(--accent)" }} />
          <p className="italic" style={{ color: "var(--text-secondary)" }}>Opening your journal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex" style={{ backgroundColor: "var(--bg)" }}>
      <Sidebar
        entries={entries}
        selectedId={selectedId}
        onSelect={handleSelect}
        onNew={handleNew}
        onExport={handleExport}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="lg:hidden flex items-center gap-2 px-4 py-2 border-b-2"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm flex items-center gap-1.5" style={{ color: "var(--text)" }}>
            <BookOpen size={16} style={{ color: "var(--accent)" }} />
            Life Journal
          </span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div
            className="lg:w-80 xl:w-96 shrink-0 p-4 lg:p-6 overflow-y-auto border-b-2 lg:border-b-0 lg:border-r-2"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
                <CalendarDays size={14} />
                Journal Calendar
              </h2>
              {selectedDate && (
                <button
                  onClick={() => handleSelectDate(null)}
                  className="text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                  style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-hover)" }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--border)"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                >
                  Clear date
                </button>
              )}
            </div>

            <CalendarView
              entries={entries}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onOpenYearly={() => setShowYearly(true)}
            />

            {selectedDate && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    {dateEntries.length > 0
                      ? `${dateEntries.length} ${dateEntries.length === 1 ? "entry" : "entries"} on this day`
                      : "No entries on this day"}
                  </h3>
                  {dateEntries.length === 0 && (
                    <button
                      onClick={handleNew}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                      onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      <Plus size={12} />
                      Write now
                    </button>
                  )}
                </div>

                {dateEntries.length > 0 && (
                  <div className="space-y-1 max-h-[200px] overflow-y-auto">
                    {dateEntries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => { setSelectedId(entry.id); setView("editor"); }}
                        className="w-full text-left px-3 py-2 rounded-xl border transition-all text-sm"
                        style={{
                          backgroundColor: selectedId === entry.id ? "var(--accent-bg)" : "transparent",
                          borderColor: selectedId === entry.id ? "var(--accent)" : "var(--border-light)",
                        }}
                        onMouseOver={(e) => {
                          if (selectedId !== entry.id) {
                            e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (selectedId !== entry.id) {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate" style={{ color: "var(--text)" }}>
                            {entry.title || "Untitled"}
                          </span>
                          <span className="ml-auto">
                            <MoodIcon mood={entry.mood} size={18} />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {view === "editor" && selectedEntry ? (
              <EntryEditor
                entry={selectedEntry}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                key={selectedEntry.id}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-sm">
                  <CalendarDays size={64} className="mx-auto mb-6" style={{ color: "var(--text-tertiary)" }} />
                  <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
                    {selectedDate ? "No entry for this day" : "Welcome to Life Journal"}
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                    {selectedDate
                      ? "Click the button above to write your first entry for this day."
                      : "Select a date on the calendar, or create a new entry from the sidebar."}
                  </p>
                  {!selectedDate && (
                    <button
                      onClick={handleNew}
                      className="btn-accent-glow inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                      style={{
                        backgroundColor: "var(--accent)",
                        color: "#fff",
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                      onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      <Plus size={16} />
                      Write your first entry
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showYearly && (
        <YearlyOverview
          entries={entries}
          onClose={() => setShowYearly(false)}
        />
      )}
    </div>
  );
}

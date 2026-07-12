"use client";

import { useMemo, useState, useEffect } from "react";
import { Entry, MOODS, Mood } from "@/lib/types";
import CalendarView from "./CalendarView";
import MoodIcon from "./MoodIcon";
import { getStreak } from "@/lib/storage";
import { Flame, Activity, LayoutGrid, CalendarDays, Quote as QuoteIcon } from "lucide-react";

interface DashboardProps {
  entries: Entry[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onOpenYearly: () => void;
  onSelectEntry: (id: string) => void;
  onNew: (date?: string | null) => void;
}

export default function Dashboard({
  entries,
  selectedDate,
  onSelectDate,
  onOpenYearly,
  onSelectEntry,
  onNew,
}: DashboardProps) {
  const streak = getStreak();
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);

  useEffect(() => {
    fetch("https://dummyjson.com/quotes/random")
      .then((res) => res.json())
      .then((data) => setQuote({ text: data.quote, author: data.author }))
      .catch((err) => console.error("Failed to fetch quote", err));
  }, []);

  const moodCounts = useMemo(() => {
    const counts = new Map<Mood, number>();
    entries.forEach((e) => {
      counts.set(e.mood, (counts.get(e.mood) || 0) + 1);
    });
    return MOODS.map((m) => ({
      ...m,
      count: counts.get(m.value) || 0,
    })).sort((a, b) => b.count - a.count);
  }, [entries]);

  const dateEntries = useMemo(() => {
    if (!selectedDate) return [];
    return entries.filter((e) => e.createdAt.slice(0, 10) === selectedDate);
  }, [entries, selectedDate]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8" style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text)" }}>Dashboard</h1>
          <p style={{ color: "var(--text-secondary)" }}>Welcome back. You have {entries.length} entries in total.</p>
        </div>

        <div className="flex items-center gap-4 bg-opacity-20 px-4 py-2 rounded-2xl" style={{ backgroundColor: "var(--streak-bg)", color: "var(--streak-text)" }}>
          <Flame size={24} style={{ color: "var(--accent)" }} />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">Current Streak</div>
            <div className="text-xl font-bold">{streak} days</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Calendar & Date Entries */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
                <CalendarDays size={20} />
                Calendar
              </h2>
              {selectedDate && (
                <button
                  onClick={() => onSelectDate(null)}
                  className="btn btn-secondary text-xs py-1.5 px-3"
                >
                  Clear Selection
                </button>
              )}
            </div>
            <CalendarView
              entries={entries}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              onOpenYearly={onOpenYearly}
            />
          </div>

          {selectedDate && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>
                  Entries on {new Date(selectedDate).toLocaleDateString()}
                </h3>
              </div>

              {dateEntries.length > 0 ? (
                <div className="grid gap-4">
                  {dateEntries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => onSelectEntry(entry.id)}
                      className="list-item flex flex-col gap-2 p-4"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-lg" style={{ color: "var(--text)" }}>{entry.title || "Untitled"}</span>
                        <MoodIcon mood={entry.mood} size={20} />
                      </div>
                      <p className="text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {entry.content.replace(/<[^>]*>/g, "")}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="mb-4" style={{ color: "var(--text-secondary)" }}>No entries found for this date.</p>
                  <button
                    onClick={() => onNew(selectedDate)}
                    className="btn btn-primary btn-accent-glow"
                  >
                    Write an entry for {selectedDate}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Mood Stats, Quotes, & Activity */}
        <div className="space-y-6">
          <div className="rounded-3xl p-6 shadow-sm border-2 text-center" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
            <QuoteIcon size={32} className="mx-auto mb-4" style={{ color: "var(--accent)" }} />
            {quote ? (
              <>
                <p className="text-lg italic font-medium mb-4" style={{ color: "var(--text)" }}>"{quote.text}"</p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>— {quote.author}</p>
              </>
            ) : (
              <div className="animate-pulse space-y-3">
                <div className="h-4 rounded w-3/4 mx-auto" style={{ backgroundColor: "var(--border-light)" }}></div>
                <div className="h-4 rounded w-1/2 mx-auto" style={{ backgroundColor: "var(--border-light)" }}></div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--text)" }}>
              <Activity size={20} />
              Mood Analytics
            </h2>

            <div className="space-y-4">
              {moodCounts.filter(m => m.count > 0).map((mood) => {
                const percentage = entries.length > 0 ? Math.round((mood.count / entries.length) * 100) : 0;
                return (
                  <div key={mood.value} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium" style={{ color: "var(--text)" }}>
                        <MoodIcon mood={mood.value as Mood} size={16} />
                        {mood.label}
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>{mood.count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-light)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%`, backgroundColor: mood.color }}
                      />
                    </div>
                  </div>
                );
              })}

              {entries.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: "var(--text-tertiary)" }}>
                  Write your first entry to see mood analytics.
                </p>
              )}
            </div>
          </div>

          <div className="card text-center">
            <LayoutGrid size={32} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
            <h3 className="font-bold mb-2" style={{ color: "var(--text)" }}>Need Inspiration?</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Try using a writing prompt in the editor to spark your creativity today.
            </p>
            <button
              onClick={() => onNew()}
              className="btn btn-secondary w-full"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              Start New Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

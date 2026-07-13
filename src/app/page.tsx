"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Entry } from "@/lib/types";
import { getEntries, createEntry, updateEntry, getPin, setPin as savePin } from "@/lib/storage";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import EntryEditor from "@/components/EntryEditor";
import Dashboard from "@/components/Dashboard";
import YearlyOverview from "@/components/YearlyOverview";
import ThemeSelector from "@/components/ThemeSelector";
import PinLock from "@/components/PinLock";
import SetPinModal from "@/components/SetPinModal";
import PeacockFeatherIcon from "@/components/icons/PeacockFeatherIcon";

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showYearly, setShowYearly] = useState(false);
  
  // Pin Lock state
  const [isLocked, setIsLocked] = useState(false);
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [showSetPinModal, setShowSetPinModal] = useState(false);

  useEffect(() => {
    setEntries(getEntries());
    const savedPin = getPin();
    if (savedPin) {
      setPinHash(savedPin);
      setIsLocked(true);
    }

    const today = new Date();
    const yy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setSelectedDate(`${yy}-${mm}-${dd}`);

    setIsLoaded(true);
  }, []);

  const selectedEntry = selectedId
    ? entries.find((e) => e.id === selectedId) ?? null
    : null;

  function handleNew(dateStr?: string | null) {
    let createdAtObj = new Date();
    if (typeof dateStr === "string" && dateStr) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        createdAtObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
      }
    }

    const entry = createEntry({
      title: "",
      content: "",
      mood: "thoughtful",
      tags: [],
      createdAt: createdAtObj.toISOString(),
    });
    setEntries((prev) => [entry, ...prev]);
    setSelectedId(entry.id);
    setSidebarOpen(false);
  }

  function handleSelect(id: string | null) {
    setSelectedId(id);
    setSidebarOpen(false);
  }

  function handleSelectDate(date: string | null) {
    setSelectedDate(date);
    if (date) {
      setSelectedId(null);
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

  const handleTogglePin = useCallback((id: string) => {
    setEntries((prev) => {
      const target = prev.find((e) => e.id === id);
      if (!target) return prev;
      const updated = updateEntry(id, { isPinned: !target.isPinned });
      if (!updated) return prev;
      return prev.map((e) => (e.id === id ? updated : e));
    });
  }, []);

  function handleExport() {
    if (entries.length === 0) return;
    const allContent = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>Inkwell Export</title>
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
        <h1>Inkwell</h1>
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
        <p style="text-align:center;color:#9d96b8;font-size:12px;margin-top:48px;">Made with Inkwell — 100% private, 100% yours.</p>
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

  function handleLockApp() {
    if (pinHash) {
      setIsLocked(true);
    } else {
      setShowSetPinModal(true);
    }
  }

  function handlePinConfirmed(newPin: string) {
    savePin(newPin);
    setPinHash(newPin);
    setShowSetPinModal(false);
    setIsLocked(true);
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
          <PeacockFeatherIcon size={64} className="mx-auto mb-4 animate-pulse" />
          <p className="italic" style={{ color: "var(--text-secondary)" }}>Opening your journal…</p>
        </div>
      </div>
    );
  }

  if (isLocked && pinHash) {
    return <PinLock correctPin={pinHash} onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="h-full flex" style={{ backgroundColor: "var(--bg)" }}>
      <Sidebar
        entries={entries}
        selectedId={selectedId}
        onSelect={handleSelect}
        onNew={handleNew}
        onExport={handleExport}
        onTogglePin={handleTogglePin}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        hasPin={!!pinHash}
        onLockApp={handleLockApp}
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
            <PeacockFeatherIcon size={16} />
            Inkwell
          </span>
          <div className="ml-auto">
            <ThemeSelector />
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedId && selectedEntry ? (
            <EntryEditor
              entry={selectedEntry}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              key={selectedEntry.id}
            />
          ) : (
            <Dashboard
              entries={entries}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onOpenYearly={() => setShowYearly(true)}
              onSelectEntry={handleSelect}
              onNew={handleNew}
            />
          )}
        </div>
      </div>

      {showYearly && (
        <YearlyOverview
          entries={entries}
          onClose={() => setShowYearly(false)}
        />
      )}

      <SetPinModal
        open={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        onConfirm={handlePinConfirmed}
      />
    </div>
  );
}

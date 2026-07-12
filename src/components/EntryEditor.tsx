"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Entry, MOODS, Mood, WEATHER_OPTIONS } from "@/lib/types";
import { updateEntry, deleteEntry } from "@/lib/storage";
import {
  FileText,
  Trash2,
  BookOpen,
  Star,
  MapPin,
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Wind
} from "lucide-react";
import MoodPicker from "./MoodPicker";
import TagInput from "./TagInput";
import Dropdown from "./ui/Dropdown";
import RichTextEditor from "./Editor/RichTextEditor";

const weatherOptionsWithIcons = WEATHER_OPTIONS.map(opt => {
  let IconCmp = Cloud;
  if (opt.icon === "Sun") IconCmp = Sun;
  if (opt.icon === "CloudRain") IconCmp = CloudRain;
  if (opt.icon === "CloudLightning") IconCmp = CloudLightning;
  if (opt.icon === "CloudSnow") IconCmp = CloudSnow;
  if (opt.icon === "Wind") IconCmp = Wind;
  return { ...opt, icon: <IconCmp size={16} /> };
});

interface EntryEditorProps {
  entry: Entry | null;
  onDelete: (id: string) => void;
  onUpdate: (entry: Entry) => void;
}

export default function EntryEditor({ entry, onDelete, onUpdate }: EntryEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState("");
  const [saved, setSaved] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load entry data when selected entry changes
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setMood(entry.mood);
      setTags(entry.tags);
      setIsFavorite(entry.isFavorite || false);
      setLocation(entry.location || "");
      setWeather(entry.weather || "");
      setSaved(true);
      setConfirmDelete(false);
    }
  }, [entry?.id]);

  const doSave = useCallback(
    (
      t: string, 
      c: string, 
      m: Mood | null, 
      tg: string[], 
      fav: boolean, 
      loc: string, 
      wea: string
    ) => {
      if (!entry || !m) return;
      const updated = updateEntry(entry.id, {
        title: t,
        content: c,
        mood: m,
        tags: tg,
        isFavorite: fav,
        location: loc,
        weather: wea
      });
      if (updated) {
        setSaved(true);
        onUpdate(updated);
      }
    },
    [entry?.id, onUpdate]
  );

  function debounceSave(
    t: string, 
    c: string, 
    m: Mood | null, 
    tg: string[], 
    fav: boolean, 
    loc: string, 
    wea: string
  ) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(t, c, m, tg, fav, loc, wea), 800);
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    setSaved(false);
    debounceSave(val, content, mood, tags, isFavorite, location, weather);
  }

  function handleContentChange(html: string) {
    setContent(html);
    setSaved(false);
    debounceSave(title, html, mood, tags, isFavorite, location, weather);
  }

  function handleMoodChange(val: Mood) {
    setMood(val);
    setSaved(false);
    debounceSave(title, content, val, tags, isFavorite, location, weather);
  }

  function handleTagsChange(val: string[]) {
    setTags(val);
    setSaved(false);
    debounceSave(title, content, mood, val, isFavorite, location, weather);
  }

  function toggleFavorite() {
    const newVal = !isFavorite;
    setIsFavorite(newVal);
    setSaved(false);
    debounceSave(title, content, mood, tags, newVal, location, weather);
  }

  function handleLocationChange(val: string) {
    setLocation(val);
    setSaved(false);
    debounceSave(title, content, mood, tags, isFavorite, val, weather);
  }

  function handleWeatherChange(val: string) {
    setWeather(val);
    setSaved(false);
    debounceSave(title, content, mood, tags, isFavorite, location, val);
  }

  function handleDelete() {
    if (!entry) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteEntry(entry.id);
    onDelete(entry.id);
  }

  function wordCount(html: string): number {
    const text = html.replace(/<[^>]*>/g, "").trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }

  function handleExportPDF() {
    if (!entry) return;
    const moodInfo = MOODS.find((m) => m.value === entry.mood);
    const exportContent = `
      <html>
      <head>
        <meta charset="utf-8">
        <title>${entry.title || "Journal Entry"}</title>
        <style>
          @page { margin: 20mm; }
          body { font-family: 'Inter', -apple-system, sans-serif; color: #1e1b2e; line-height: 1.8; max-width: 700px; margin: 0 auto; padding: 40px 20px; }
          h1 { font-size: 28px; margin-bottom: 8px; color: #1e1b2e; }
          .meta { color: #9d96b8; font-size: 14px; margin-bottom: 32px; }
          .mood { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-bottom: 24px; }
          .tags { margin-bottom: 24px; }
          .tag { display: inline-block; padding: 2px 8px; border-radius: 6px; background: #eef0ff; color: #4338ca; font-size: 12px; margin-right: 4px; }
          .content { margin-top: 24px; }
          .content p { margin-bottom: 16px; }
          .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2dff0; font-size: 12px; color: #9d96b8; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${entry.title || "Untitled"}</h1>
        <div class="meta">${new Date(entry.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        ${moodInfo ? `<div class="mood">${moodInfo.label}</div>` : ""}
        ${entry.tags.length > 0 ? `<div class="tags">${entry.tags.map((t) => `<span class="tag">#${t}</span>`).join(" ")}</div>` : ""}
        <div class="content">${entry.content}</div>
        <div class="footer">From my Life Journal — a private reflection</div>
      </body>
      </html>
    `;

    const blob = new Blob([exportContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-entry-${entry.id.slice(0, 8)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!entry) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <BookOpen size={64} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Your Life Journal</h2>
          <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Select an entry from the sidebar or create a new one to start writing.
            This is your private space — every word stays on your device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Header info (Mood, Favorite, Saved status) */}
      <div className="flex flex-col bg-[var(--bg-card)]">
        <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-[var(--border)]">
          <MoodPicker value={mood} onChange={handleMoodChange} />

          <div className="w-px h-6 bg-[var(--border)]" />

          <button
            onClick={toggleFavorite}
            className="btn btn-icon btn-ghost"
            style={{ color: isFavorite ? "var(--accent)" : "var(--text-secondary)" }}
            title={isFavorite ? "Unfavorite" : "Favorite"}
          >
            <Star size={18} fill={isFavorite ? "var(--accent)" : "none"} />
          </button>
          
          <div className="ml-auto flex items-center gap-3">
            <span
              className="text-xs"
              style={{ color: saved ? "var(--text-tertiary)" : "var(--accent)" }}
            >
              {saved ? "● Saved" : "○ Saving…"}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              | {wordCount(content)} words
            </span>
          </div>
        </div>
        
        <div className="px-6 py-4 border-b border-[var(--border-light)]">
          {/* Date */}
          <p className="text-sm mb-2" style={{ color: "var(--text-tertiary)" }}>
            {new Date(entry.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {/* Title */}
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Entry title…"
            className="w-full text-4xl font-bold bg-transparent border-none outline-none mb-6"
            style={{ color: "var(--text)" }}
            onFocus={(e) => e.currentTarget.style.setProperty("--tw-placeholder-color", "var(--text-tertiary)")}
          />
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Location */}
            <div className="flex items-center gap-2 w-48">
              <MapPin size={16} style={{ color: "var(--text-tertiary)" }} />
              <input
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                placeholder="Add location..."
                className="input-field"
              />
            </div>

            {/* Weather using Custom Dropdown */}
            <div className="flex items-center gap-2 w-48 z-10">
              <Cloud size={16} style={{ color: "var(--text-tertiary)" }} />
              <Dropdown 
                options={weatherOptionsWithIcons} 
                value={weather} 
                onChange={handleWeatherChange} 
                placeholder="Select weather..."
                className="w-full"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mb-2">
            <TagInput tags={tags} onChange={handleTagsChange} />
          </div>
        </div>
      </div>

      {/* Tiptap Editor */}
      <div className="flex-1 overflow-hidden flex flex-col relative z-0">
        <RichTextEditor content={content} onChange={handleContentChange} />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t-2 border-[var(--border)] bg-[var(--bg-card)]">
        <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {entry.createdAt.split("T")[0] === new Date().toISOString().split("T")[0]
            ? "Writing today"
            : "Past entry"}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="btn btn-secondary text-xs py-1.5 px-3"
          >
            <FileText size={14} />
            Export
          </button>
          <button
            onClick={handleDelete}
            className={`btn text-xs py-1.5 px-3 ${confirmDelete ? 'btn-danger' : 'btn-secondary'}`}
          >
            <Trash2 size={14} />
            {confirmDelete ? "Confirm?" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

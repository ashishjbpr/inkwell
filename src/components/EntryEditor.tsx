"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Entry, MOODS, Mood, WEATHER_OPTIONS } from "@/lib/types";
import { updateEntry, deleteEntry } from "@/lib/storage";
import { exportEntryHTML, exportEntryXML } from "@/lib/export";
import {
  FileText,
  Trash2,
  Star,
  MapPin,
  Cloud,
  Sun,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Wind,
  Code,
  Pin,
  Maximize2,
  Minimize2
} from "lucide-react";
import MoodPicker from "./MoodPicker";
import PeacockFeatherIcon from "./icons/PeacockFeatherIcon";
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

const FLAG_COLORS = [
  { value: "", label: "None" },
  { value: "#EF4444", label: "Red" },
  { value: "#F59E0B", label: "Orange" },
  { value: "#10B981", label: "Green" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#8B5CF6", label: "Purple" }
];

interface EntryEditorProps {
  entry: Entry | null;
  onDelete: (id: string) => void;
  onUpdate: (entry: Entry) => void;
  customMoods?: Mood[];
}

export default function EntryEditor({ entry, onDelete, onUpdate, customMoods = [] }: EntryEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [colorFlag, setColorFlag] = useState("");
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!isFullscreen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsFullscreen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Load entry data when selected entry changes
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setMood(entry.mood);
      setTags(entry.tags);
      setIsFavorite(entry.isFavorite || false);
      setIsPinned(entry.isPinned || false);
      setColorFlag(entry.colorFlag || "");
      setLocation(entry.location || "");
      setWeather(entry.weather || "");
      setSaveState("saved");
      setConfirmDelete(false);
    }
  }, [entry?.id]);

  const doSave = useCallback(
    async (
      t: string,
      c: string,
      m: Mood | null,
      tg: string[],
      fav: boolean,
      pin: boolean,
      flag: string,
      loc: string,
      wea: string
    ) => {
      if (!entry || !m) return;
      try {
        const updated = await updateEntry(entry.id, {
          title: t,
          content: c,
          mood: m,
          tags: tg,
          isFavorite: fav,
          isPinned: pin,
          colorFlag: flag,
          location: loc,
          weather: wea
        });
        if (updated) {
          setSaveState("saved");
          onUpdate(updated);
        }
      } catch {
        setSaveState("error");
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
    pin: boolean,
    flag: string,
    loc: string, 
    wea: string
  ) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(t, c, m, tg, fav, pin, flag, loc, wea), 800);
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    setSaveState("saving");
    debounceSave(val, content, mood, tags, isFavorite, isPinned, colorFlag, location, weather);
  }

  function handleContentChange(html: string) {
    setContent(html);
    setSaveState("saving");
    debounceSave(title, html, mood, tags, isFavorite, isPinned, colorFlag, location, weather);
  }

  function handleMoodChange(val: Mood) {
    setMood(val);
    setSaveState("saving");
    debounceSave(title, content, val, tags, isFavorite, isPinned, colorFlag, location, weather);
  }

  function handleTagsChange(val: string[]) {
    setTags(val);
    setSaveState("saving");
    debounceSave(title, content, mood, val, isFavorite, isPinned, colorFlag, location, weather);
  }

  function toggleFavorite() {
    const newVal = !isFavorite;
    setIsFavorite(newVal);
    setSaveState("saving");
    debounceSave(title, content, mood, tags, newVal, isPinned, colorFlag, location, weather);
  }

  function togglePinned() {
    const newVal = !isPinned;
    setIsPinned(newVal);
    setSaveState("saving");
    debounceSave(title, content, mood, tags, isFavorite, newVal, colorFlag, location, weather);
  }

  function handleColorFlagChange(val: string) {
    setColorFlag(val);
    setSaveState("saving");
    debounceSave(title, content, mood, tags, isFavorite, isPinned, val, location, weather);
  }

  function handleLocationChange(val: string) {
    setLocation(val);
    setSaveState("saving");
    debounceSave(title, content, mood, tags, isFavorite, isPinned, colorFlag, val, weather);
  }

  function handleWeatherChange(val: string) {
    setWeather(val);
    setSaveState("saving");
    debounceSave(title, content, mood, tags, isFavorite, isPinned, colorFlag, location, val);
  }

  async function handleDelete() {
    if (!entry) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteEntry(entry.id);
    onDelete(entry.id);
  }

  function wordCount(html: string): number {
    const text = html.replace(/<[^>]*>/g, "").trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }

  function handleExportHTML() {
    if (!entry) return;
    exportEntryHTML(entry);
  }

  function handleExportXML() {
    if (!entry) return;
    exportEntryXML(entry);
  }

  if (!entry) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <PeacockFeatherIcon size={64} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Your Inkwell</h2>
          <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Select an entry from the sidebar or create a new one to start writing.
            This is your private space, synced securely to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col overflow-hidden"
          : "flex-1 flex flex-col h-full overflow-hidden"
      }
      style={isFullscreen ? { backgroundColor: "var(--bg)" } : undefined}
    >
      {/* Top Header info (Mood, Favorite, Saved status) */}
      <div className="flex flex-col bg-[var(--bg-card)]">
        <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-[var(--border)]">
          <MoodPicker value={mood} onChange={handleMoodChange} customMoods={customMoods} />

          <div className="w-px h-6 bg-[var(--border)]" />

          <button
            onClick={togglePinned}
            className="btn btn-icon btn-ghost"
            style={{ color: isPinned ? "var(--accent)" : "var(--text-secondary)" }}
            title={isPinned ? "Unpin" : "Pin Note"}
          >
            <Pin size={18} className={isPinned ? "-rotate-45" : ""} fill={isPinned ? "currentColor" : "none"} />
          </button>

          <button
            onClick={toggleFavorite}
            className="btn btn-icon btn-ghost"
            style={{ color: isFavorite ? "var(--accent)" : "var(--text-secondary)" }}
            title={isFavorite ? "Unfavorite" : "Favorite"}
          >
            <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          
          <div className="w-px h-6 bg-[var(--border)] mx-1" />
          
          <div className="flex items-center gap-1.5 px-2">
            {FLAG_COLORS.filter(c => c.value).map(c => (
               <button
                 key={c.value}
                 onClick={() => handleColorFlagChange(colorFlag === c.value ? "" : c.value)}
                 className={`w-4 h-4 rounded-full transition-transform ${colorFlag === c.value ? "scale-125 ring-2 ring-offset-2 ring-offset-[var(--bg-card)] ring-[var(--accent)]" : "hover:scale-110"}`}
                 style={{ backgroundColor: c.value }}
                 title={`Flag ${c.label}`}
               />
            ))}
          </div>

          {isFullscreen && (
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Entry title…"
              className="flex-1 min-w-0 text-sm font-semibold bg-transparent border-none outline-none px-2"
              style={{ color: "var(--text)" }}
            />
          )}

          <div className="ml-auto flex items-center gap-3">
            <span
              className="text-xs"
              style={{ color: saveState === "error" ? "#ef4444" : saveState === "saved" ? "var(--text-tertiary)" : "var(--accent)" }}
            >
              {saveState === "error" ? "⚠ Not saved" : saveState === "saved" ? "● Saved" : "○ Saving…"}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              | {wordCount(content)} words
            </span>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn btn-icon btn-ghost"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {!isFullscreen && (
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
        )}
      </div>

      {/* Tiptap Editor */}
      <div className="flex-1 overflow-hidden flex flex-col relative z-0">
        <RichTextEditor content={content} onChange={handleContentChange} />
      </div>

      {/* Bottom bar */}
      {!isFullscreen && (
      <div className="flex items-center justify-between px-4 py-2 border-t-2 border-[var(--border)] bg-[var(--bg-card)]">
        <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {entry.createdAt.split("T")[0] === new Date().toISOString().split("T")[0]
            ? "Writing today"
            : "Past entry"}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--bg-hover)] rounded-xl p-1 border border-[var(--border)]">
            <button
              onClick={handleExportHTML}
              className="btn btn-secondary text-xs py-1.5 px-3 border-none bg-transparent hover:bg-[var(--bg-card)]"
              title="Export as HTML"
            >
              <FileText size={14} />
              HTML
            </button>
            <button
              onClick={handleExportXML}
              className="btn btn-secondary text-xs py-1.5 px-3 border-none bg-transparent hover:bg-[var(--bg-card)]"
              title="Export as XML"
            >
              <Code size={14} />
              XML
            </button>
          </div>
          <button
            onClick={handleDelete}
            className={`btn text-xs py-1.5 px-3 ${confirmDelete ? 'btn-danger' : 'btn-secondary'}`}
          >
            <Trash2 size={14} />
            {confirmDelete ? "Confirm?" : "Delete"}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}

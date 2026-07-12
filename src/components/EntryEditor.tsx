"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Entry, MOODS, Mood } from "@/lib/types";
import { updateEntry, deleteEntry } from "@/lib/storage";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Sparkles,
  FileText,
  Trash2,
  BookOpen,
} from "lucide-react";
import MoodPicker from "./MoodPicker";
import TagInput from "./TagInput";
import PromptModal from "./PromptModal";

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
  const [showPrompt, setShowPrompt] = useState(false);
  const [saved, setSaved] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load entry data when selected entry changes
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setMood(entry.mood);
      setTags(entry.tags);
      setSaved(true);
      setConfirmDelete(false);
    }
  }, [entry?.id]);

  const doSave = useCallback(
    (t: string, c: string, m: Mood | null, tg: string[]) => {
      if (!entry || !m) return;
      const updated = updateEntry(entry.id, {
        title: t,
        content: c,
        mood: m,
        tags: tg,
      });
      if (updated) {
        setSaved(true);
        onUpdate(updated);
      }
    },
    [entry?.id, onUpdate]
  );

  function handleTitleChange(val: string) {
    setTitle(val);
    setSaved(false);
    debounceSave(val, content, mood, tags);
  }

  function handleContentChange() {
    const el = contentRef.current;
    if (!el) return;
    const html = el.innerHTML;
    setContent(html);
    setSaved(false);
    debounceSave(title, html, mood, tags);
  }

  function handleMoodChange(val: Mood) {
    setMood(val);
    setSaved(false);
    debounceSave(title, content, val, tags);
  }

  function handleTagsChange(val: string[]) {
    setTags(val);
    setSaved(false);
    debounceSave(title, content, mood, val);
  }

  function debounceSave(t: string, c: string, m: Mood | null, tg: string[]) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(t, c, m, tg), 800);
  }

  function handlePromptSelect(prompt: string) {
    const el = contentRef.current;
    if (!el) return;
    el.focus();
    document.execCommand("insertText", false, prompt + "\n\n");
    handleContentChange();
  }

  function execCmd(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
    handleContentChange();
    contentRef.current?.focus();
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
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b-2 flex-wrap"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
      >
        <MoodPicker value={mood} onChange={handleMoodChange} />

        <div className="w-px h-6" style={{ backgroundColor: "var(--border)" }} />

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => execCmd("bold")}
            className="px-2.5 py-1.5 rounded-lg text-sm font-bold transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => execCmd("italic")}
            className="px-2.5 py-1.5 rounded-lg text-sm transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => execCmd("underline")}
            className="px-2.5 py-1.5 rounded-lg text-sm transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            title="Underline"
          >
            <Underline size={16} />
          </button>
        </div>

        <div className="w-px h-6" style={{ backgroundColor: "var(--border)" }} />

        <button
          onClick={() => execCmd("insertUnorderedList")}
          className="px-2.5 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5"
          style={{ color: "var(--text-secondary)" }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          title="Bullet list"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => execCmd("insertOrderedList")}
          className="px-2.5 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5"
          style={{ color: "var(--text-secondary)" }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          title="Numbered list"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px h-6" style={{ backgroundColor: "var(--border)" }} />

        <button
          onClick={() => setShowPrompt(true)}
          className="px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5"
          style={{ color: "var(--text-secondary)" }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          title="Get a writing prompt"
        >
          <Sparkles size={16} />
          Prompt
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span
            className="text-xs"
            style={{ color: saved ? "var(--text-tertiary)" : "var(--accent)" }}
          >
            {saved ? "● Saved" : "○ Saving…"}
          </span>
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            | {wordCount(content)} words
          </span>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
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
            className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-4"
            style={{ color: "var(--text)" }}
            onFocus={(e) => e.currentTarget.style.setProperty("--tw-placeholder-color", "var(--text-tertiary)")}
          />

          {/* Tags */}
          <div className="mb-4">
            <TagInput tags={tags} onChange={handleTagsChange} />
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            className="prose max-w-none outline-none min-h-[300px] leading-relaxed"
            style={{
              color: "var(--text)",
              fontSize: "16px",
              lineHeight: "1.8",
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t-2"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
      >
        <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {entry.createdAt.split("T")[0] === new Date().toISOString().split("T")[0]
            ? "Writing today"
            : "Past entry"}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 rounded-lg border-2 text-xs font-medium transition-colors flex items-center gap-1.5"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <FileText size={14} />
            Export
          </button>
          <button
            onClick={handleDelete}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              confirmDelete ? "" : ""
            }`}
            style={{
              backgroundColor: confirmDelete ? "var(--accent)" : "transparent",
              color: confirmDelete ? "#fff" : "var(--text-secondary)",
              border: `2px solid ${confirmDelete ? "var(--accent)" : "var(--border)"}`,
            }}
            onMouseOver={(e) => {
              if (!confirmDelete) {
                e.currentTarget.style.backgroundColor = "var(--bg-hover)";
              }
            }}
            onMouseOut={(e) => {
              if (!confirmDelete) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <Trash2 size={14} />
            {confirmDelete ? "Confirm?" : "Delete"}
          </button>
        </div>
      </div>

      {/* Prompt Modal */}
      <PromptModal
        open={showPrompt}
        onClose={() => setShowPrompt(false)}
        onSelect={handlePromptSelect}
      />
    </div>
  );
}

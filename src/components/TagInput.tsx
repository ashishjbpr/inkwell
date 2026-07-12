"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag(tag: string) {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl border-2 transition-colors min-h-[42px]"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
      onBlur={(e) => e.currentTarget.style.borderColor = "var(--border)"}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium border"
          style={{
            backgroundColor: "var(--accent-bg)",
            color: "var(--accent-text)",
            borderColor: "var(--accent)",
          }}
        >
          #{tag}
          <button
            onClick={() => removeTag(tag)}
            className="transition-colors leading-none hover:opacity-70"
            style={{ color: "var(--accent-text)" }}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? "Add tags…" : ""}
        className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-sm py-0.5"
        style={{ color: "var(--text)" }}
      />
    </div>
  );
}

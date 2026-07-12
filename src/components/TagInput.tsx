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
      className="input-field flex flex-wrap items-center gap-1.5 min-h-[42px] focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:border-[var(--accent)]"
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="badge badge-primary"
        >
          #{tag}
          <button
            onClick={() => removeTag(tag)}
            className="hover:opacity-70 flex items-center justify-center p-0.5 rounded-full"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? "Add tags…" : ""}
        className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-sm py-0.5 text-[var(--text)]"
      />
    </div>
  );
}

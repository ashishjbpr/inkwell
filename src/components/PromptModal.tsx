"use client";

import { useState } from "react";
import { Sparkles, Shuffle, PenLine, X } from "lucide-react";
import { WRITING_PROMPTS } from "@/lib/types";

interface PromptModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (prompt: string) => void;
}

export default function PromptModal({ open, onClose, onSelect }: PromptModalProps) {
  const [prompt, setPrompt] = useState(
    () => WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)]
  );

  if (!open) return null;

  function shuffle() {
    setPrompt(WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)]);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(17, 15, 31, 0.5)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border-2 p-6 shadow-2xl"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <Sparkles size={28} style={{ color: "var(--accent)" }} />
          <h3 className="text-lg font-bold mt-2" style={{ color: "var(--text)" }}>Writing Prompt</h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Stuck? Let inspiration find you.</p>
        </div>

        <div
          className="p-4 rounded-2xl border mb-4"
          style={{
            backgroundColor: "var(--accent-bg)",
            borderColor: "var(--accent)",
          }}
        >
          <p
            className="leading-relaxed font-serif italic text-lg"
            style={{ color: "var(--accent-text)" }}
          >
            &ldquo;{prompt}&rdquo;
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={shuffle}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-colors flex items-center justify-center gap-2"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <Shuffle size={16} />
            Shuffle
          </button>
          <button
            onClick={() => {
              onSelect(prompt);
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
          >
            <PenLine size={16} />
            Use This Prompt
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="card w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="btn btn-icon btn-secondary absolute top-4 right-4"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <Sparkles size={28} style={{ color: "var(--accent)" }} />
          <h3 className="text-lg font-bold mt-2 text-[var(--text)]">Writing Prompt</h3>
          <p className="text-sm text-[var(--text-secondary)]">Stuck? Let inspiration find you.</p>
        </div>

        <div className="p-4 rounded-xl border mb-4 bg-[var(--accent-bg)] border-[var(--accent)]">
          <p className="leading-relaxed font-serif italic text-lg text-[var(--accent-text)]">
            &ldquo;{prompt}&rdquo;
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={shuffle}
            className="btn btn-secondary flex-1"
          >
            <Shuffle size={16} />
            Shuffle
          </button>
          <button
            onClick={() => {
              onSelect(prompt);
              onClose();
            }}
            className="btn btn-primary flex-1"
          >
            <PenLine size={16} />
            Use This Prompt
          </button>
        </div>
      </div>
    </div>
  );
}

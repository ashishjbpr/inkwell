"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

interface MigrationPromptProps {
  count: number;
  onImport: () => Promise<void>;
  onSkip: () => void;
}

export default function MigrationPrompt({ count, onImport, onSkip }: MigrationPromptProps) {
  const [importing, setImporting] = useState(false);

  async function handleImport() {
    setImporting(true);
    try {
      await onImport();
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="card w-full max-w-sm flex flex-col items-center text-center">
        <UploadCloud size={40} className="mb-4 mt-2" style={{ color: "var(--accent)" }} />
        <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text)" }}>
          Import your entries
        </h3>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          We found {count} {count === 1 ? "entry" : "entries"} stored on this device. Import{" "}
          {count === 1 ? "it" : "them"} into your account to sync across devices?
          <br />
          <span style={{ color: "var(--text-tertiary)" }}>
            Note: images embedded in entries may not appear on other devices.
          </span>
        </p>
        <div className="flex gap-3 w-full">
          <button onClick={onSkip} className="btn btn-secondary flex-1" disabled={importing}>
            Skip
          </button>
          <button onClick={handleImport} className="btn btn-primary flex-1" disabled={importing}>
            {importing ? "Importing…" : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Lock, Delete, X } from "lucide-react";

interface SetPinModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
}

export default function SetPinModal({ open, onClose, onConfirm }: SetPinModalProps) {
  const [stage, setStage] = useState<"create" | "confirm">("create");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  if (!open) return null;

  function reset() {
    setStage("create");
    setFirstPin("");
    setPin("");
    setError(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleNumber(num: number) {
    if (pin.length >= 4) return;
    const newPin = pin + num;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (stage === "create") {
        setTimeout(() => {
          setFirstPin(newPin);
          setPin("");
          setStage("confirm");
        }, 150);
      } else {
        if (newPin === firstPin) {
          const confirmed = newPin;
          setTimeout(() => {
            onConfirm(confirmed);
            reset();
          }, 150);
        } else {
          setError(true);
          setTimeout(() => {
            setPin("");
            setStage("create");
            setFirstPin("");
          }, 500);
        }
      }
    }
  }

  function handleDelete() {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setError(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="card w-full max-w-xs relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="btn btn-icon btn-secondary absolute top-4 right-4"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <Lock size={40} className="mb-4 mt-2" style={{ color: error ? "var(--accent)" : "var(--text-tertiary)" }} />
        <h3 className="text-lg font-bold mb-1 text-[var(--text)]">
          {error ? "PINs didn't match" : stage === "create" ? "Set a PIN" : "Confirm your PIN"}
        </h3>
        <p className="text-sm mb-6 text-[var(--text-secondary)]">
          {error ? "Let's try again" : stage === "create" ? "Enter a 4-digit PIN" : "Enter it once more"}
        </p>

        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border-2 transition-colors"
              style={{
                borderColor: error ? "var(--accent)" : "var(--text-secondary)",
                backgroundColor: pin.length > i ? "currentColor" : "transparent",
                color: error ? "var(--accent)" : "var(--text)",
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold mx-auto transition-colors bg-[var(--bg-hover)] hover:bg-[var(--border)] text-[var(--text)]"
            >
              {num}
            </button>
          ))}
          <div /> {/* Empty cell */}
          <button
            onClick={() => handleNumber(0)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold mx-auto transition-colors bg-[var(--bg-hover)] hover:bg-[var(--border)] text-[var(--text)]"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold mx-auto transition-colors bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)]"
          >
            <Delete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

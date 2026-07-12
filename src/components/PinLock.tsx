"use client";

import { useState } from "react";
import { Lock, Delete } from "lucide-react";

interface PinLockProps {
  correctPin: string;
  onUnlock: () => void;
}

export default function PinLock({ correctPin, onUnlock }: PinLockProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function handleNumber(num: number) {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setTimeout(onUnlock, 200);
        } else {
          setError(true);
          setTimeout(() => setPin(""), 400);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-xs w-full p-6 flex flex-col items-center">
        <Lock size={48} className="mb-6" style={{ color: error ? "var(--accent)" : "var(--text-tertiary)" }} />
        <h2 className="text-xl font-bold mb-8">Enter PIN</h2>
        
        <div className="flex gap-4 mb-12">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${pin.length > i ? "bg-current" : "bg-transparent"}`}
              style={{ borderColor: error ? "var(--accent)" : "var(--text-secondary)" }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold mx-auto transition-colors bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
            >
              {num}
            </button>
          ))}
          <div /> {/* Empty cell */}
          <button
            onClick={() => handleNumber(0)}
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold mx-auto transition-colors bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold mx-auto transition-colors bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)]"
          >
            <Delete size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

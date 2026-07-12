"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm transition-all outline-none bg-[var(--bg-card)] border cursor-pointer ${
          isOpen
            ? "border-[var(--accent)] ring-2 ring-[var(--accent)]"
            : "border-[var(--border)]"
        }`}
        style={{
          color: selectedOption ? "var(--text)" : "var(--text-tertiary)",
        }}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="text-current opacity-70">{selectedOption.icon}</span>}
              <span className="truncate">{selectedOption.label}</span>
            </>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="popover-content top-full left-0 mt-1 w-full min-w-[140px]">
          <div className="max-h-60 overflow-y-auto scrollbar-thin p-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isSelected ? "" : "hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: "var(--accent-bg)", color: "var(--accent-text)" }
                      : { color: "var(--text-secondary)" }
                  }
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span>{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {isSelected && <Check size={14} style={{ color: "var(--accent)" }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

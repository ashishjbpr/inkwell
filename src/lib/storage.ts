"use client";

import { Entry } from "./types";

const STORAGE_KEY = "life-journal-entries";
const PIN_KEY = "life-journal-pin";

export function getPin(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PIN_KEY);
}

export function setPin(pin: string | null): void {
  if (typeof window === "undefined") return;
  if (pin === null) {
    localStorage.removeItem(PIN_KEY);
  } else {
    localStorage.setItem(PIN_KEY, pin);
  }
}

export function validatePin(pin: string): boolean {
  const stored = getPin();
  if (!stored) return true; // No pin set
  return stored === pin;
}

export function getEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Entry[];
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getEntry(id: string): Entry | undefined {
  return getEntries().find((e) => e.id === id);
}

export function createEntry(entry: Omit<Entry, "id" | "createdAt" | "updatedAt"> & { createdAt?: string }): Entry {
  const entries = getEntries();
  const now = entry.createdAt || new Date().toISOString();
  const newEntry: Entry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  entries.unshift(newEntry);
  saveEntries(entries);
  return newEntry;
}

export function updateEntry(id: string, updates: Partial<Omit<Entry, "id" | "createdAt">>): Entry | undefined {
  const entries = getEntries();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return undefined;
  entries[idx] = {
    ...entries[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveEntries(entries);
  return entries[idx];
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id);
  saveEntries(entries);
}

export function getStreak(): number {
  const entries = getEntries();
  if (entries.length === 0) return 0;

  // Get unique dates (by day) in local time sorted descending
  const dates = [
    ...new Set(
      entries.map((e) => {
        const d = new Date(e.createdAt);
        return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
      })
    ),
  ].sort((a, b) => b.localeCompare(a));

  let streak = 0;
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("en-CA");

  const startIdx = dates[0] === todayStr || dates[0] === yesterdayStr ? 0 : -1;
  if (startIdx === -1) return 0;

  // Since we use YYYY-MM-DD, creating a date from it parses as UTC midnight, which is consistent for math
  const checkDate = new Date(dates[0]); 
  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(checkDate);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split("T")[0];
    if (dates[i] === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

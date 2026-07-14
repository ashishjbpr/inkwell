"use client";

import { Entry } from "./types";

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

export async function getEntries(): Promise<Entry[]> {
  const res = await fetch("/api/entries");
  if (!res.ok) throw new Error("Failed to load entries");
  return res.json();
}

export async function createEntry(
  entry: Omit<Entry, "id" | "createdAt" | "updatedAt"> & { createdAt?: string }
): Promise<Entry> {
  const id = crypto.randomUUID();
  const now = entry.createdAt || new Date().toISOString();
  const res = await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...entry, id, createdAt: now }),
  });
  if (!res.ok) throw new Error("Failed to create entry");
  return res.json();
}

export async function updateEntry(
  id: string,
  updates: Partial<Omit<Entry, "id" | "createdAt">>
): Promise<Entry | undefined> {
  const res = await fetch(`/api/entries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error("Failed to update entry");
  return res.json();
}

export async function deleteEntry(id: string): Promise<void> {
  const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error("Failed to delete entry");
}

export function getStreak(entries: Entry[]): number {
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

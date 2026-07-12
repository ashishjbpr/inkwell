"use client";

import { Entry } from "./types";

const STORAGE_KEY = "life-journal-entries";

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

export function createEntry(entry: Omit<Entry, "id" | "createdAt" | "updatedAt">): Entry {
  const entries = getEntries();
  const now = new Date().toISOString();
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

  // Get unique dates (by day) sorted descending
  const dates = [
    ...new Set(
      entries.map((e) => e.createdAt.split("T")[0])
    ),
  ].sort((a, b) => b.localeCompare(a));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if there's an entry today or yesterday to start streak
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const startIdx = dates[0] === todayStr || dates[0] === yesterdayStr ? 0 : -1;
  if (startIdx === -1) return 0;

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

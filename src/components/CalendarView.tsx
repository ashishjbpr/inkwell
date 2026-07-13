"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Entry } from "@/lib/types";

interface CalendarViewProps {
  entries: Entry[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onOpenYearly: () => void;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

function getMonthGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1);
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const grid: (number | null)[][] = [];
  let week: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    week.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    grid.push(week);
  }

  return grid;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export default function CalendarView({
  entries,
  selectedDate,
  onSelectDate,
  onOpenYearly,
}: CalendarViewProps) {
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [showPicker, setShowPicker] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const grid = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const yearOptions = useMemo(() => {
    const start = today.getFullYear() - 100;
    const end = today.getFullYear() + 20;
    const years: number[] = [];
    for (let y = end; y >= start; y--) years.push(y);
    return years;
  }, [today]);

  useEffect(() => {
    if (!showPicker) return;
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  const entryDateSet = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      set.add(e.createdAt.slice(0, 10));
    });
    return set;
  }, [entries]);

  function prevMonth() {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function nextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  function goToToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    if (selectedDate !== todayStr) {
      onSelectDate(todayStr);
    }
  }

  return (
    <div className="calendar-widget">
      {/* Calendar header */}
      <div className="calendar-header">
        <button onClick={prevMonth} className="cal-nav-btn" aria-label="Previous month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="cal-title-wrap" ref={pickerRef}>
          <button
            type="button"
            className="cal-title cal-title-btn"
            onClick={() => setShowPicker((v) => !v)}
            aria-haspopup="true"
            aria-expanded={showPicker}
          >
            {MONTHS[viewMonth]} {viewYear}
          </button>
          {showPicker && (
            <div className="cal-picker">
              <select
                className="cal-picker-select"
                style={{ colorScheme: isDark ? "dark" : "light" }}
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                aria-label="Select month"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <select
                className="cal-picker-select"
                style={{ colorScheme: isDark ? "dark" : "light" }}
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                aria-label="Select year"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button onClick={nextMonth} className="cal-nav-btn" aria-label="Next month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="cal-weekdays">
        {WEEKDAYS.map((d) => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="cal-grid">
        {grid.map((week, wi) =>
          week.map((day, di) => {
            if (day === null) {
              return <div key={`${wi}-${di}`} className="cal-day cal-day-empty" />;
            }

            const dateStr = toDateStr(viewYear, viewMonth, day);
            const hasEntry = entryDateSet.has(dateStr);
            const isSelected = selectedDate === dateStr;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={dateStr}
                className={`cal-day ${isSelected ? "cal-day-selected" : ""} ${isToday ? "cal-day-today" : ""}`}
                onClick={() => onSelectDate(dateStr)}
                aria-label={`${MONTHS[viewMonth]} ${day}, ${viewYear}${hasEntry ? " — has entries" : ""}`}
              >
                <span className="cal-day-num">{day}</span>
                {hasEntry && <span className="cal-dot" />}
              </button>
            );
          })
        )}
      </div>

      {/* Footer actions */}
      <div className="calendar-footer">
        <button onClick={goToToday} className="cal-footer-btn">
          Today
        </button>
        <button onClick={onOpenYearly} className="cal-footer-btn cal-footer-btn-accent">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Year Overview
        </button>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Entry } from "@/lib/types";

interface YearlyOverviewProps {
  entries: Entry[];
  onClose: () => void;
}

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export default function YearlyOverview({ entries, onClose }: YearlyOverviewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());

  const entryDateSet = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      const key = e.createdAt.slice(0, 10);
      if (key.startsWith(String(year))) {
        set.add(key);
      }
    });
    return set;
  }, [entries, year]);

  // Count per month
  const monthCounts = useMemo(() => {
    const counts: number[] = new Array(12).fill(0);
    entries.forEach((e) => {
      const d = new Date(e.createdAt);
      if (d.getFullYear() === year) {
        counts[d.getMonth()]++;
      }
    });
    return counts;
  }, [entries, year]);

  const totalForYear = monthCounts.reduce((a, b) => a + b, 0);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, month) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1);
      let startDay = firstDay.getDay() - 1;
      if (startDay < 0) startDay = 6;

      const cells: (number | null)[] = [];
      for (let i = 0; i < startDay; i++) cells.push(null);
      for (let d = 1; d <= daysInMonth; d++) cells.push(d);

      return { month, daysInMonth, startDay, cells };
    });
  }, [year]);

  return (
    <div className="yearly-overlay" onClick={onClose}>
      <div className="card w-full max-w-[820px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="yearly-header">
          <h2 className="yearly-title">Year Overview</h2>
          <div className="yearly-nav">
            <button onClick={() => setYear((y) => y - 1)} className="yearly-nav-btn" aria-label="Previous year">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="yearly-year">{year}</span>
            <button onClick={() => setYear((y) => y + 1)} className="yearly-nav-btn" aria-label="Next year">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <button onClick={onClose} className="yearly-close" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="yearly-stats">
          <span className="badge badge-primary">{totalForYear} entries this year</span>
          <span className="badge badge-primary">{monthCounts.filter((c) => c > 0).length} active months</span>
        </div>

        <div className="yearly-months">
          {months.map(({ month, cells }) => (
            <div key={month} className="yearly-month">
              <div className="yearly-month-label">
                {MONTH_SHORT[month]}
                <span className="yearly-month-count">{monthCounts[month]}</span>
              </div>
              <div className="yearly-weekdays">
                {WEEKDAYS.map((d) => (
                  <span key={d} className="yearly-wd">{d[0]}</span>
                ))}
              </div>
              <div className="yearly-grid">
                {cells.map((day, i) => {
                  if (day === null) {
                    return <div key={`e-${i}`} className="yearly-cell yearly-cell-empty" />;
                  }
                  const dateStr = toDateStr(year, month, day);
                  const hasEntry = entryDateSet.has(dateStr);
                  const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

                  return (
                    <div
                      key={dateStr}
                      className={`yearly-cell ${hasEntry ? "yearly-cell-done" : "yearly-cell-missed"} ${isToday ? "yearly-cell-today" : ""}`}
                      title={`${dateStr}${hasEntry ? " ✓" : " ✗"}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="yearly-legend">
          <div className="yearly-legend-item">
            <div className="yearly-legend-swatch yearly-legend-done" /> Written
          </div>
          <div className="yearly-legend-item">
            <div className="yearly-legend-swatch yearly-legend-missed" /> Missed
          </div>
          <div className="yearly-legend-item">
            <div className="yearly-legend-swatch yearly-legend-today" /> Today
          </div>
        </div>
      </div>
    </div>
  );
}

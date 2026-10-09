"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import type { ReleaseWindow } from "@/lib/domain/types";
import { WeekDetail } from "./WeekDetail";

const dayLabel = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const monthLabel = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function ReleaseCalendar({
  windows,
  currentDate,
  recommendedDate,
}: {
  windows: ReleaseWindow[];
  currentDate: string | null;
  recommendedDate: string | null;
}) {
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [month, setMonth] = useState(
    currentDate?.slice(0, 7) ?? windows[0]?.weekStart.slice(0, 7) ?? "all",
  );
  const months = [
    ...new Set(windows.map((window) => window.weekStart.slice(0, 7))),
  ];
  const activeMonth =
    month === "all" || months.includes(month) ? month : (months[0] ?? "all");
  const visible =
    activeMonth === "all"
      ? windows
      : windows.filter((window) => window.weekStart.startsWith(activeMonth));

  if (!windows.length)
    return (
      <div className="ws-empty">
        <CalendarDays size={28} />
        <h3>No dated release evidence</h3>
        <p>A launch recommendation needs dated releases for this horizon.</p>
      </div>
    );
  return (
    <div>
      <div className="ws-calendar-toolbar">
        <div
          className="ws-calendar-months"
          role="group"
          aria-label="Filter release weeks by month"
        >
          {months.map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={activeMonth === value}
              onClick={() => setMonth(value)}
            >
              {monthLabel.format(new Date(`${value}-01T00:00:00Z`))}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={activeMonth === "all"}
            onClick={() => setMonth("all")}
          >
            All weeks
          </button>
        </div>
      </div>
      <div className="ws-calendar-toolbar">
        <span>
          {visible.length} weeks · Select a week to see its competition
        </span>
        <div>
          <span className="ws-badge green">Low pressure</span>
          <span className="ws-badge amber">Higher pressure</span>
        </div>
      </div>
      {visible.map((window) => {
        const planned = Boolean(
          currentDate &&
          currentDate >= window.weekStart &&
          currentDate < window.weekEnd,
        );
        const best = recommendedDate === window.weekStart;
        const expanded = expandedWeek === window.weekStart;
        const color =
          window.band === "CRITICAL"
            ? "#ff8b8b"
            : window.band === "HIGH"
              ? "#ffc16b"
              : window.band === "MODERATE"
                ? "#89a8ff"
                : "#70d8b0";
        const label = dayLabel.format(
          new Date(`${window.weekStart}T00:00:00Z`),
        );
        return (
          <div key={window.weekStart}>
            <button
              type="button"
              className="ws-calendar-row"
              aria-expanded={expanded}
              aria-controls={`week-${window.weekStart}`}
              aria-label={`Week of ${label}${planned ? ", planned release" : ""}${best ? ", recommended" : ""}, risk ${window.risk} of 100, ${window.competingReleases.length} competing releases`}
              onClick={() =>
                setExpandedWeek(expanded ? null : window.weekStart)
              }
            >
              <span className="ws-calendar-date">
                <strong>{label}</strong>
                {planned || best ? (
                  <small>{planned ? "Your planned week" : "Recommended"}</small>
                ) : null}
              </span>
              <span className="ws-risk-track">
                <span
                  style={{
                    width: `${Math.max(0, Math.min(100, window.risk))}%`,
                    background: color,
                  }}
                />
              </span>
              <span className="ws-risk-value" style={{ color }}>
                {window.risk}
                <span className="ws-muted text-[9px]"> /100</span>
              </span>
              <span className="ws-calendar-count">
                {window.competingReleases.length} release
                {window.competingReleases.length === 1 ? "" : "s"}
              </span>
              {expanded ? (
                <ChevronUp size={15} className="ws-muted" />
              ) : (
                <ChevronDown size={15} className="ws-muted" />
              )}
            </button>
            <div id={`week-${window.weekStart}`} hidden={!expanded}>
              {expanded ? <WeekDetail window={window} /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

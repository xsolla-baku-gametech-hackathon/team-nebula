"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReleaseWindow } from "@/lib/domain/types";
import { WeekDetail } from "./WeekDetail";

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

  if (!windows.length) {
    return <p className="text-[12px] text-on-surface-variant">No dated releases were returned for this horizon.</p>;
  }

  return (
    <div className="space-y-2">
      {windows.map((window) => {
        const isCurrent = Boolean(currentDate && currentDate >= window.weekStart && currentDate < window.weekEnd);
        const isBest = recommendedDate === window.weekStart;
        const isExpanded = expandedWeek === window.weekStart;

        return (
          <div key={window.weekStart} className="rounded-lg border border-outline-variant/20 overflow-hidden">
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setExpandedWeek(isExpanded ? null : window.weekStart)}
              className="w-full px-3 py-2.5 text-left hover:bg-surface-container-high transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-[72px] text-[11px] font-mono text-on-surface-variant">{window.weekStart.slice(5)}</span>
                <div className="h-1.5 flex-1 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      window.band === "CRITICAL" ? "bg-red" :
                      window.band === "HIGH" ? "bg-yellow" :
                      window.band === "MODERATE" ? "bg-primary" : "bg-green"
                    }`}
                    style={{ width: `${Math.max(2, window.risk)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[11px] font-mono text-on-surface">{window.risk}</span>
                <span className="w-[120px] text-right text-[10px] font-mono text-on-surface-variant">
                  {window.competingReleases.length} release{window.competingReleases.length === 1 ? "" : "s"}
                  {isCurrent ? <span className="ml-1 text-red">planned</span> : null}
                  {isBest ? <span className="ml-1 text-green">best</span> : null}
                </span>
                {isExpanded ? <ChevronUp size={16} className="text-on-surface-variant" /> : <ChevronDown size={16} className="text-on-surface-variant" />}
              </div>
            </button>
            {isExpanded ? <WeekDetail window={window} /> : null}
          </div>
        );
      })}
    </div>
  );
}

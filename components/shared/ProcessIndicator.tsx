"use client";

import { useEffect, useState } from "react";
import { Check, Database, ScanSearch, Sparkles, TrendingUp } from "lucide-react";

export type ProcessKind = "discovery" | "collection" | "analysis";

const COPY: Record<ProcessKind, { eyebrow: string; title: string; stages: string[] }> = {
  discovery: {
    eyebrow: "Concept validation",
    title: "Preparing a comparable search",
    stages: [
      "Understanding the game concept",
      "Mapping gameplay and audience signals",
      "Checking the search criteria",
      "Preparing comparable candidates",
    ],
  },
  collection: {
    eyebrow: "Evidence collection",
    title: "Building the reviewed market cohort",
    stages: [
      "Verifying selected Steam identities",
      "Collecting price and release facts",
      "Preparing commercial estimates",
      "Organizing reviews and source labels",
    ],
  },
  analysis: {
    eyebrow: "Market analysis",
    title: "Building the investment view",
    stages: [
      "Scoring comparable similarity",
      "Measuring saturation and concentration",
      "Evaluating candidate launch weeks",
      "Preparing ranges and recommendations",
    ],
  },
};

const STAGE_ICONS = [Sparkles, ScanSearch, Database, TrendingUp];

export function ProcessIndicator({ kind, compact = false }: { kind: ProcessKind; compact?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const content = COPY[kind];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => Math.min(current + 1, content.stages.length - 1));
    }, 1150);
    return () => window.clearInterval(interval);
  }, [content.stages.length]);

  return (
    <section className={`overflow-hidden rounded-2xl border border-primary/25 bg-surface-container-low ${compact ? "p-4" : "p-5 sm:p-6"}`} aria-live="polite" aria-busy="true">
      <div className="flex items-start gap-4">
        <div className="processing-orbit relative flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/8">
          <span className="size-2 rounded-full bg-primary shadow-[0_0_14px_rgba(108,140,255,0.75)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.13em] text-secondary">{content.eyebrow}</p>
          <h2 className="mt-1 font-heading text-[16px] font-semibold text-on-surface">{content.title}</h2>
          <p className="mt-1 text-[11px] text-on-surface-variant">{content.stages[activeIndex]}</p>
        </div>
        <span className="font-mono text-[10px] tabular-nums text-on-surface-variant">{activeIndex + 1}/{content.stages.length}</span>
      </div>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-surface-container-highest">
        <span className="processing-progress block h-full rounded-full bg-primary" style={{ width: `${((activeIndex + 1) / content.stages.length) * 100}%` }} />
      </div>

      {!compact ? (
        <ol className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {content.stages.map((stage, index) => {
            const Icon = STAGE_ICONS[index];
            const complete = index < activeIndex;
            const active = index === activeIndex;
            return (
              <li key={stage} className={`rounded-xl border p-3 transition-colors ${active ? "border-primary/35 bg-primary/7" : "border-outline-variant/25 bg-surface-container/45"}`}>
                <span className={`flex size-7 items-center justify-center rounded-lg ${complete ? "bg-green/10 text-green" : active ? "bg-primary/12 text-primary" : "text-on-surface-variant/50"}`}>
                  {complete ? <Check size={14} /> : <Icon size={14} />}
                </span>
                <p className={`mt-3 text-[10px] leading-relaxed ${active || complete ? "text-on-surface" : "text-on-surface-variant/55"}`}>{stage}</p>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}

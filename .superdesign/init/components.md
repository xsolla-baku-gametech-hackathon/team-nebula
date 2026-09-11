# Shared UI components

## `components/shared/LoadingSkeleton.tsx`

Reusable loading placeholder.

```tsx
"use client";

import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-zinc-200 dark:bg-zinc-800", className)} />
  );
}
```

## `components/shared/ProvenanceTag.tsx`

Source and estimation disclosure for facts and forecasts.

```tsx
"use client";

import type { Sourced } from "@/lib/types";

export function ProvenanceTag<T>({ sourced }: { sourced: Sourced<T> }) {
  const color = {
    steam: "text-blue-500",
    igdb: "text-purple-500",
    gamalytic: "text-green-500",
    releasesignal: "text-amber-500",
    user: "text-zinc-400",
  }[sourced.source];

  return (
    <span
      className={`inline-flex items-center text-xs ${color} cursor-help`}
      title={`Source: ${sourced.source}${sourced.estimated ? " (estimated)" : ""}${sourced.method ? ` · ${sourced.method}` : ""}`}
    >
      i
    </span>
  );
}
```

## `components/shared/ScoreBar.tsx`

Accessible score visualization with numeric label and risk band.

```tsx
"use client";

import { cn } from "@/lib/utils";

const BAND_COLORS: Record<string, string> = {
  LOW: "bg-green-500",
  MODERATE: "bg-yellow-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

export function ScoreBar({ score, band, label }: { score: number; band: string; label?: string }) {
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span className="font-mono">
            {score} / 100 <span className="text-xs font-sans">{band}</span>
          </span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className={cn("h-full rounded-full transition-all", BAND_COLORS[band] ?? "bg-zinc-400")}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  );
}
```

## `components/shared/DriverList.tsx`

Compact model-driver list.

```tsx
"use client";

import type { Driver } from "@/lib/types";

export function DriverList({ drivers }: { drivers: Driver[] }) {
  return (
    <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
      {drivers.map((d, i) => (
        <li key={i} className="flex justify-between">
          <span>{d.label}</span>
          <span className="font-mono text-xs">
            {d.contribution > 0 ? "+" : ""}
            {d.contribution}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

## `components/shared/DegradedBanner.tsx`

Honest notice when a source or analysis capability is reduced.

```tsx
"use client";

import type { DegradedFlag } from "@/lib/types";

const MESSAGES: Record<DegradedFlag, string> = {
  llm_fallback: "Using simplified analysis — you can edit fields directly",
  embedding_fallback: "Reduced-precision matching",
  no_gamalytic: "Revenue estimates use our model (Gamalytic data unavailable)",
};

export function DegradedBanner({ flags }: { flags: DegradedFlag[] }) {
  if (flags.length === 0) return null;
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      {flags.map((f) => (
        <p key={f}>{MESSAGES[f]}</p>
      ))}
    </div>
  );
}
```

## `components/shared/StaleSnapshotBanner.tsx`

Warning and recovery action for outdated report snapshots.

```tsx
"use client";

export function StaleSnapshotBanner({ onReanalyze }: { onReanalyze: () => void }) {
  return (
    <div className="rounded-lg border border-blue-300 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200 flex justify-between items-center">
      <span>Concept changed since last analysis. Results may be stale.</span>
      <button onClick={onReanalyze} className="underline font-medium">
        Re-analyze
      </button>
    </div>
  );
}
```

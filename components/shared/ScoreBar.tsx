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

"use client";

import { useState } from "react";
import type { SimilarityComponents } from "@/lib/domain/types";

const LABELS: (keyof SimilarityComponents)[] = [
  "semantic",
  "mechanics",
  "genre",
  "theme",
  "gameMode",
  "price",
];

export function SimilarityBadge({
  score,
  components,
}: {
  score: number;
  components: SimilarityComponents;
}) {
  const [expanded, setExpanded] = useState(false);

  const color =
    score >= 80
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : score >= 60
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`px-2.5 py-1 rounded-full text-sm font-mono font-semibold ${color}`}
      >
        {score}
      </button>
      {expanded && (
        <div className="absolute right-0 top-full mt-1 z-20 w-56 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 shadow-lg text-xs space-y-1.5">
          {LABELS.map((key) => {
            const val = components[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="w-16 text-zinc-500">{key}</span>
                <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${Math.round(val * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono">
                  {(val * 100).toFixed(0)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

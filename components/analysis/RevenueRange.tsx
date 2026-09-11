"use client";

import type { MarketReport } from "@/lib/types";

function fmt(n: number | null): string {
  if (n === null) return "Unavailable";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export function RevenueRange({ revenue }: { revenue: MarketReport["revenue"] }) {
  if (revenue.conservative === null || revenue.base === null || revenue.upside === null) {
    return (
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Estimated First-Year Gross</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Insufficient revenue evidence.</p>
      </div>
    );
  }

  const range = revenue.upside - revenue.conservative;
  const basePos = range > 0 ? ((revenue.base - revenue.conservative) / range) * 100 : 50;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Estimated First-Year Gross</h3>

      <div className="flex justify-between text-sm">
        <div className="text-center">
          <p className="text-zinc-500 text-xs">Conservative</p>
          <p className="font-mono font-semibold">{fmt(revenue.conservative)}</p>
        </div>
        <div className="text-center">
          <p className="text-zinc-500 text-xs">Base</p>
          <p className="font-mono font-semibold text-lg">{fmt(revenue.base)}</p>
        </div>
        <div className="text-center">
          <p className="text-zinc-500 text-xs">Upside</p>
          <p className="font-mono font-semibold">{fmt(revenue.upside)}</p>
        </div>
      </div>

      <div className="relative h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300 rounded-full opacity-30" />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-zinc-950"
          style={{ left: `${basePos}%` }}
        />
      </div>

      <p className="text-xs text-zinc-500 text-center">
        {revenue.confidence} confidence · {revenue.basedOnCount} comparables · {revenue.method}
      </p>
    </div>
  );
}

"use client";

import type { ScoredCompetitor } from "@/lib/domain/types";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import { SimilarityBadge } from "./SimilarityBadge";

function formatRevenue(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

function formatCount(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return String(v);
}

export function CompetitorCard({
  competitor,
  onRemove,
  onDetails,
}: {
  competitor: ScoredCompetitor;
  onRemove?: () => void;
  onDetails?: () => void;
}) {
  const g = competitor.game;
  const sim = competitor.similarity;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{g.identity.name}</h3>
          <p className="text-xs text-zinc-500">
            {g.release.date?.slice(0, 7) ?? "—"} · {g.commercial.priceUsd.value != null ? `$${g.commercial.priceUsd.value}` : "—"}
          </p>
        </div>
        <SimilarityBadge score={sim.score} components={sim.components} />
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-zinc-500 text-xs">Revenue</p>
          <p className="font-mono">
            {formatRevenue(g.commercial.estimatedRevenueUsd.value)}{" "}
            <ProvenanceTag sourced={g.commercial.estimatedRevenueUsd} />
          </p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs">Copies</p>
          <p className="font-mono">
            {formatCount(g.commercial.estimatedCopiesSold.value)}{" "}
            <ProvenanceTag sourced={g.commercial.estimatedCopiesSold} />
          </p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs">Reviews</p>
          <p className="font-mono">
            {formatCount(g.reviews.total.value)}
            {g.reviews.positiveRatio.value != null && (
              <span className="text-zinc-400"> · {Math.round(g.reviews.positiveRatio.value * 100)}%</span>
            )}{" "}
            <ProvenanceTag sourced={g.reviews.total} />
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
        {sim.rationale}
      </p>

      <div className="flex gap-3 text-xs">
        <a
          href={g.identity.steamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Steam
        </a>
        {onDetails && (
          <button onClick={onDetails} className="text-zinc-500 hover:text-foreground">
            Details
          </button>
        )}
        {onRemove && (
          <button onClick={onRemove} className="text-zinc-400 hover:text-red-500 ml-auto">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

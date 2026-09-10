"use client";

import type { ScoredCompetitor } from "@/lib/types";
import { CompetitorCard } from "./CompetitorCard";

export function CompetitorGrid({
  competitors,
  totalCandidates,
  onRemove,
  onDetails,
}: {
  competitors: ScoredCompetitor[];
  totalCandidates: number;
  onRemove: (appId: number) => void;
  onDetails: (appId: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-zinc-500">
          {competitors.length} comparables · ranked from {totalCandidates} candidates
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitors.map((c) => (
          <CompetitorCard
            key={c.game.identity.steamAppId}
            competitor={c}
            onRemove={() => onRemove(c.game.identity.steamAppId)}
            onDetails={() => onDetails(c.game.identity.steamAppId)}
          />
        ))}
      </div>
    </div>
  );
}

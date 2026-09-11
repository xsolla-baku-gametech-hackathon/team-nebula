"use client";

import type { NormalizedGame } from "@/lib/domain/types";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";

export function CompetitorDrawer({
  game,
  onClose,
}: {
  game: NormalizedGame;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-xl z-50 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{game.identity.name}</h2>
            <p className="text-sm text-zinc-500">
              {game.release.date ?? "—"} · {game.metadata.developers.join(", ") || "Unknown developer"}
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-foreground text-lg">
            x
          </button>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {game.metadata.summary}
        </p>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Genres</h3>
          <div className="flex flex-wrap gap-1.5">
            {game.metadata.genres.map((g) => (
              <span key={g} className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800">
                {g}
              </span>
            ))}
          </div>
        </div>

        {game.metadata.themes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Themes</h3>
            <div className="flex flex-wrap gap-1.5">
              {game.metadata.themes.map((t) => (
                <span key={t} className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500 text-xs">Price</p>
            <p>
              {game.commercial.priceUsd.value != null ? `$${game.commercial.priceUsd.value}` : "—"}{" "}
              <ProvenanceTag sourced={game.commercial.priceUsd} />
            </p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Reviews</p>
            <p>
              {game.reviews.total.value?.toLocaleString() ?? "—"}{" "}
              <ProvenanceTag sourced={game.reviews.total} />
            </p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Est. Revenue</p>
            <p>
              {game.commercial.estimatedRevenueUsd.value != null
                ? `$${(game.commercial.estimatedRevenueUsd.value / 1000).toFixed(0)}k`
                : "—"}{" "}
              <ProvenanceTag sourced={game.commercial.estimatedRevenueUsd} />
            </p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs">Positive</p>
            <p>
              {game.reviews.positiveRatio.value != null
                ? `${Math.round(game.reviews.positiveRatio.value * 100)}%`
                : "—"}{" "}
              <ProvenanceTag sourced={game.reviews.positiveRatio} />
            </p>
          </div>
        </div>

        <a
          href={game.identity.steamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-blue-500 hover:underline"
        >
          View on Steam
        </a>
      </div>
    </div>
  );
}

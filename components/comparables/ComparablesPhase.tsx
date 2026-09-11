"use client";

import { ArrowLeft, ArrowRight, ExternalLink, Filter, MoreVertical, RotateCcw } from "lucide-react";
import { useState } from "react";
import StepPills, { type Step } from "@/components/shared/StepPills";
import { ProcessIndicator } from "@/components/shared/ProcessIndicator";
import type { ScoredCompetitor } from "@/lib/domain/types";

interface Props {
  competitors: ScoredCompetitor[];
  onNext: () => void;
  onBack: () => void;
  onStartNewSession: () => void;
  loading?: boolean;
  error?: string | null;
  resultsStale: boolean;
  plannedRelease: string;
  targetPrice: number | null;
  launchInputError: string | null;
  unlockedSteps: Step[];
  onNavigate: (step: Step) => void;
  onPlannedReleaseChange: (value: string) => void;
  onTargetPriceChange: (value: number | null) => void;
}

function steamCapsuleUrl(appId: number): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_231x87.jpg`;
}

function fmt(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtCount(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

function sentimentLabel(ratio: number | null): string {
  if (ratio === null) return "—";
  if (ratio >= 0.95) return "Overwhelmingly Positive";
  if (ratio >= 0.85) return "Very Positive";
  if (ratio >= 0.70) return "Mostly Positive";
  if (ratio >= 0.50) return "Mixed";
  return "Mostly Negative";
}

function GameCard({ c }: { c: ScoredCompetitor }) {
  const g = c.game;
  const matchPct = Math.round(c.similarity.score * 100);

  return (
    <div className="flex gap-3 rounded-xl border border-outline-variant/20 bg-surface-container p-3 hover:border-outline-variant/40 transition-colors">
      {/* Capsule art */}
      <div className="w-[100px] h-[100px] rounded-lg overflow-hidden shrink-0 bg-surface-container-high">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={steamCapsuleUrl(g.identity.steamAppId)}
          alt={g.identity.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-mono text-primary font-medium">{matchPct}% match</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-green/15 text-green font-medium">Approved</span>
            </div>
            <h3 className="text-[15px] font-semibold text-on-surface truncate">{g.identity.name}</h3>
          </div>
          <button className="text-on-surface-variant/50 hover:text-on-surface-variant shrink-0">
            <MoreVertical size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {g.metadata.tags.slice(0, 3).map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded text-[10px] text-on-surface-variant border border-outline-variant/20">{t}</span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-4 text-[12px]">
            <span className="text-on-surface font-semibold">${g.commercial.priceUsd.value?.toFixed(2) ?? "—"}</span>
            <span className="text-on-surface-variant">{fmtCount(g.reviews.total.value)} reviews</span>
            <span className="text-on-surface-variant">{sentimentLabel(g.reviews.positiveRatio.value)}</span>
          </div>
          <a href={g.identity.steamUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
            <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ComparablesPhase({
  competitors, onNext, onBack, onStartNewSession, loading, error, resultsStale,
  plannedRelease, targetPrice, launchInputError, unlockedSteps, onNavigate,
  onPlannedReleaseChange, onTargetPriceChange,
}: Props) {
  const [filter, setFilter] = useState<"all" | "approved">("all");

  // Compute summary stats
  const avgSimilarity = competitors.length
    ? Math.round(competitors.reduce((s, c) => s + c.similarity.score, 0) / competitors.length * 100)
    : 0;
  const prices = competitors.map(c => c.game.commercial.priceUsd.value).filter((p): p is number => p !== null);
  const medianPrice = prices.length ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : null;
  const avgReviewSentiment = competitors.length
    ? competitors.reduce((s, c) => s + (c.game.reviews.positiveRatio.value ?? 0), 0) / competitors.length
    : 0;

  return (
    <div className="mx-auto max-w-[1320px] px-6 py-5">
      <StepPills active="comparables" unlocked={unlockedSteps} onNavigate={onNavigate} />

      {resultsStale && (
        <div className="rounded-xl border border-yellow/30 bg-yellow/10 px-4 py-3 mb-4 text-[13px] text-yellow">
          These results belong to the previous description. They remain available until you approve a new comparable set.
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-red/30 bg-red/10 px-4 py-3 mb-4 text-[13px] text-red">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="font-heading text-[26px] font-semibold text-on-surface">Similar games found</h1>
          <p className="text-[14px] text-on-surface-variant mt-0.5">We found {competitors.length} relevant games for analysis. Review and adjust if needed.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} className="h-9 px-4 rounded-lg border border-outline-variant/30 text-on-surface text-[13px] font-medium hover:bg-surface-container transition-colors flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={loading || Boolean(launchInputError) || !competitors.length}
            className="h-9 px-5 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            Next <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Summary stats bar */}
      {competitors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl bg-surface-container border border-outline-variant/15 px-4 py-3">
            <p className="text-[24px] font-heading font-bold text-primary">{competitors.length}</p>
            <p className="text-[12px] text-on-surface-variant">Comparable Games</p>
          </div>
          <div className="rounded-xl bg-surface-container border border-outline-variant/15 px-4 py-3">
            <p className="text-[24px] font-heading font-bold text-green">{avgSimilarity}%</p>
            <p className="text-[12px] text-on-surface-variant">Avg. Similarity</p>
          </div>
          <div className="rounded-xl bg-surface-container border border-outline-variant/15 px-4 py-3">
            <p className="text-[24px] font-heading font-bold text-on-surface">{medianPrice ? `$${medianPrice.toFixed(2)}` : "—"}</p>
            <p className="text-[12px] text-on-surface-variant">Median Price</p>
          </div>
          <div className="rounded-xl bg-surface-container border border-outline-variant/15 px-4 py-3">
            <p className="text-[24px] font-heading font-bold text-on-surface">{avgReviewSentiment > 0 ? sentimentLabel(avgReviewSentiment) : "—"}</p>
            <p className="text-[12px] text-on-surface-variant">Avg. Reviews</p>
          </div>
        </div>
      )}

      {/* Filter tabs + launch inputs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1 rounded-lg bg-surface-container-high p-1">
          <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${filter === "all" ? "bg-surface-container-lowest text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>
            All Games ({competitors.length})
          </button>
          <button onClick={() => setFilter("approved")} className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${filter === "approved" ? "bg-surface-container-lowest text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}>
            Approved ({competitors.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
            Launch
            <input
              type="date"
              value={plannedRelease}
              onChange={(e) => onPlannedReleaseChange(e.target.value)}
              className="h-8 px-2 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface text-[12px] focus:outline-none focus:border-primary/50"
            />
          </label>
          <label className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={targetPrice ?? ""}
              onChange={(e) => onTargetPriceChange(e.target.value ? Number(e.target.value) : null)}
              placeholder="$"
              className="h-8 w-[70px] px-2 rounded-md bg-surface-container border border-outline-variant/30 text-on-surface text-[12px] focus:outline-none focus:border-primary/50"
            />
          </label>
          <button className="h-8 px-2 rounded-md border border-outline-variant/30 text-on-surface-variant hover:text-on-surface transition-colors">
            <Filter size={14} />
          </button>
        </div>
      </div>

      {launchInputError && <p className="text-[11px] text-red mb-3">{launchInputError}</p>}
      {loading && <div className="mb-4"><ProcessIndicator kind="analysis" /></div>}

      {/* Game cards */}
      {competitors.length === 0 ? (
        <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-8 text-center text-on-surface-variant">
          No comparable games found. Try adjusting your description.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {competitors.map((c) => <GameCard key={c.game.identity.steamAppId} c={c} />)}
        </div>
      )}

      <div className="flex justify-center mt-8">
        <button type="button" onClick={onStartNewSession} className="text-on-surface-variant hover:text-on-surface text-[12px] transition-colors flex items-center gap-1">
          <RotateCcw size={14} /> New session
        </button>
      </div>
    </div>
  );
}

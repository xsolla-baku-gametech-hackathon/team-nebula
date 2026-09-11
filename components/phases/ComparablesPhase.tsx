"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowLeft, ArrowRight, ExternalLink, RotateCcw } from "lucide-react";
import StepPills, { type Step } from "@/components/phases/StepPills";
import { ProcessIndicator } from "@/components/shared/ProcessIndicator";
import type { ScoredCompetitor } from "@/lib/types";

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

function steamHeaderUrl(appId: number): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
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

function Card({ c }: { c: ScoredCompetitor }) {
  const g = c.game;
  const appId = g.identity.steamAppId;

  return (
    <div className="relative rounded-xl overflow-hidden border border-outline-variant/20 hover:border-outline-variant/40 transition-colors group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={steamHeaderUrl(appId)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-container via-surface-container/90 to-surface-container/50" />

      <div className="relative p-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading text-[16px] font-semibold text-on-surface">{g.identity.name}</h3>
            <p className="text-[12px] text-on-surface-variant truncate max-w-[280px]">{g.metadata.summary}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-primary font-mono">{Math.round(c.similarity.score * 100)}% match</span>
            <a href={g.identity.steamUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
              Steam <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div><span className="text-[10px] text-on-surface-variant/60 uppercase font-mono">Revenue</span><p className="font-heading text-[15px] font-bold text-on-surface leading-tight">{fmt(g.commercial.estimatedRevenueUsd.value)}</p></div>
          <div><span className="text-[10px] text-on-surface-variant/60 uppercase font-mono">Copies</span><p className="font-heading text-[15px] font-bold text-on-surface leading-tight">{fmtCount(g.commercial.estimatedCopiesSold.value)}</p></div>
          <div><span className="text-[10px] text-on-surface-variant/60 uppercase font-mono">Reviews</span><p className="font-heading text-[15px] font-bold text-on-surface leading-tight">{fmtCount(g.reviews.total.value)}</p></div>
          <div><span className="text-[10px] text-on-surface-variant/60 uppercase font-mono">Price</span><p className="font-heading text-[15px] font-bold text-on-surface leading-tight">${g.commercial.priceUsd.value?.toFixed(2) ?? "—"}</p></div>
        </div>

        <p className="text-[11px] text-on-surface-variant leading-relaxed">{c.similarity.rationale}</p>

        <div className="flex items-end gap-3 pt-1 border-t border-outline-variant/10">
          {g.history?.revenue && g.history.revenue.length > 0 && (
            <div className="w-[100px] h-[28px] shrink-0">
              <ResponsiveContainer width="100%" height={28}>
                <LineChart data={g.history.revenue}>
                  <Tooltip contentStyle={{ background: "#1a1c26", border: "1px solid #363842", borderRadius: 6, color: "#e8e9ed", fontSize: 10, padding: "3px 6px" }} />
                  <Line type="monotone" dataKey="v" stroke="#6c8cff" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-wrap gap-1 flex-1">
            {g.metadata.tags.slice(0, 5).map((t) => (
              <span key={t} className="px-1.5 py-0.5 rounded text-[9px] text-on-surface-variant/60 border border-outline-variant/20 font-mono">{t}</span>
            ))}
          </div>
          <span className="text-[11px] text-on-surface-variant/50 shrink-0">{g.release.date?.slice(0, 7) ?? "TBD"}</span>
        </div>

        {g.reviews.comments?.length ? (
          <div className="pt-2 border-t border-outline-variant/10">
            <p className="text-[10px] uppercase font-mono text-on-surface-variant/60 mb-1.5">Recent helpful reviews</p>
            <div className="grid gap-1.5">
              {g.reviews.comments.slice(0, 3).map((comment) => (
                <p key={comment.id} className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-2">
                  <span className={comment.recommended ? "text-green" : "text-red"}>
                    {comment.recommended ? "Recommended" : "Not recommended"}:
                  </span>{" "}
                  {comment.text}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ComparablesPhase({
  competitors, onNext, onBack, onStartNewSession, loading, error, resultsStale,
  plannedRelease, targetPrice, launchInputError, unlockedSteps, onNavigate,
  onPlannedReleaseChange, onTargetPriceChange,
}: Props) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-5">
      <StepPills active="comparables" unlocked={unlockedSteps} onNavigate={onNavigate} />

      {resultsStale ? (
        <div className="rounded-xl border border-yellow/30 bg-yellow/10 px-4 py-3 mb-4 text-[13px] text-yellow">
          These results belong to the previous description. They remain available until you approve a new comparable set.
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="rounded-xl border border-red/30 bg-red/10 px-4 py-3 mb-4 text-[13px] text-red">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="font-heading text-[24px] font-semibold text-on-surface">Comparable games</h1>
          <p className="text-[13px] text-on-surface-variant">{competitors.length} games matched on gameplay description</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <label className="text-[11px] text-on-surface-variant">
            Planned release
            <input
              type="date"
              value={plannedRelease}
              onChange={(event) => onPlannedReleaseChange(event.target.value)}
              className="block mt-1 h-10 px-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-[13px] focus:outline-none focus:border-primary/50"
            />
          </label>
          <label className="text-[11px] text-on-surface-variant">
            Target price (USD)
            <input
              type="number"
              min="0"
              step="0.01"
              value={targetPrice ?? ""}
              onChange={(event) => onTargetPriceChange(event.target.value ? Number(event.target.value) : null)}
              placeholder="Optional"
              className="block mt-1 h-10 w-[140px] px-3 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-[13px] focus:outline-none focus:border-primary/50"
            />
          </label>
          <button
            type="button"
            onClick={onNext}
            disabled={loading || Boolean(launchInputError)}
            className="h-10 px-5 rounded-xl bg-primary text-on-primary text-[14px] font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Building investment view..." : "Build investment view"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {launchInputError ? <p className="text-[11px] text-red text-right mb-3">{launchInputError}</p> : null}
      {targetPrice === null ? <p className="text-[10px] text-on-surface-variant text-right mb-3">Without a target price, revenue uses reported comparable revenue without price normalization.</p> : null}

      {loading ? <div className="mb-4"><ProcessIndicator kind="analysis" /></div> : null}

      {competitors.length === 0 ? (
        <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-8 text-center text-on-surface-variant">
          No comparable games found. Try adjusting your description.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {competitors.map((c) => <Card key={c.game.identity.steamAppId} c={c} />)}
        </div>
      )}

      <div className="flex justify-center gap-5 mt-8">
        <button type="button" onClick={onBack} className="text-on-surface-variant hover:text-on-surface text-[12px] transition-colors flex items-center gap-1">
          <ArrowLeft size={14} aria-hidden="true" /> Change selection
        </button>
        <button type="button" onClick={onStartNewSession} className="text-on-surface-variant hover:text-on-surface text-[12px] transition-colors flex items-center gap-1">
          <RotateCcw size={14} aria-hidden="true" /> New session
        </button>
      </div>
    </div>
  );
}

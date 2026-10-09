"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  ExternalLink,
  Gamepad2,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import type { Step } from "@/components/shared/StepPills";
import { WorkspaceShell } from "@/components/shared/WorkspaceShell";
import { ProcessIndicator } from "@/components/shared/ProcessIndicator";
import { SimilarityBadge } from "./SimilarityBadge";
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

function compact(value: number | null, money = false): string {
  if (value === null) return "Unavailable";
  const prefix = money ? "$" : "";
  if (value >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${prefix}${(value / 1_000).toFixed(0)}K`;
  return `${prefix}${value.toLocaleString("en-US", { maximumFractionDigits: money ? 2 : 0 })}`;
}

function median(values: (number | null)[]): number | null {
  const known = values
    .filter(
      (value): value is number => value !== null && Number.isFinite(value),
    )
    .sort((a, b) => a - b);
  if (!known.length) return null;
  const mid = Math.floor(known.length / 2);
  return known.length % 2 ? known[mid] : (known[mid - 1] + known[mid]) / 2;
}

function ComparableRow({ competitor }: { competitor: ScoredCompetitor }) {
  const { game, similarity } = competitor;
  return (
    <article className="ws-game">
      <div className="ws-game-overview">
        <div className="ws-game-art-frame" aria-hidden="true">
          <Gamepad2 size={24} />
          <span>
            {game.identity.name
              .split(/\s+/)
              .slice(0, 3)
              .map((word) => word[0])
              .join("")}
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="ws-game-art"
            src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.identity.steamAppId}/header.jpg`}
            alt=""
            loading="lazy"
            onError={(event) => {
              event.currentTarget.style.visibility = "hidden";
            }}
          />
        </div>
        <div className="min-w-0">
          <div className="ws-game-title">
            <div>
              <h3>{game.identity.name}</h3>
              <a
                href={game.identity.steamUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Steam <ExternalLink size={11} />
              </a>
            </div>
            <div className="ws-match">
              <strong>{Math.round(similarity.score * 100)}%</strong>
              <span>similarity</span>
            </div>
          </div>
          <dl className="ws-game-stats">
            <div>
              <dt>
                Gross revenue <span title="Provider estimate">est.</span>
              </dt>
              <dd>
                {compact(game.commercial.estimatedRevenueUsd.value, true)}
              </dd>
            </div>
            <div>
              <dt>
                Copies sold <span title="Provider estimate">est.</span>
              </dt>
              <dd>{compact(game.commercial.estimatedCopiesSold.value)}</dd>
            </div>
            <div>
              <dt>Steam reviews</dt>
              <dd>{compact(game.reviews.total.value)}</dd>
            </div>
            <div>
              <dt>Store price</dt>
              <dd>{compact(game.commercial.priceUsd.value, true)}</dd>
            </div>
          </dl>
        </div>
      </div>
      <details className="ws-game-details">
        <summary>Why this game matches &amp; supporting evidence</summary>
        <p>{similarity.rationale}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[11px] ws-muted">Explore match factors</span>
          <SimilarityBadge
            score={Math.round(similarity.score * 100)}
            components={similarity.components}
          />
        </div>
        <p>{game.metadata.summary || "No game description available."}</p>
        <div className="ws-tags">
          {game.metadata.tags.slice(0, 8).map((tag) => (
            <span className="ws-badge" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <p className="text-[10px]">
          Released {game.release.date ?? "date unavailable"}. Revenue source:{" "}
          {game.commercial.estimatedRevenueUsd.source}. Prices and reviews:
          Steam.
        </p>
        {game.reviews.comments?.length ? (
          <div className="mt-4 border-t border-[var(--ws-border)] pt-4">
            <h4 className="text-[12px] font-medium">What players are saying</h4>
            {game.reviews.comments.slice(0, 3).map((comment) => (
              <blockquote
                key={comment.id}
                className="mt-3 border-l-2 border-[var(--ws-border)] pl-3"
              >
                <span
                  className={`text-[10px] ${comment.recommended ? "text-green" : "text-red"}`}
                >
                  {comment.recommended ? "Recommended" : "Not recommended"}
                </span>
                <p className="mt-1!">{comment.text}</p>
              </blockquote>
            ))}
          </div>
        ) : null}
      </details>
    </article>
  );
}

export default function ComparablesPhase({
  competitors,
  onNext,
  onBack,
  onStartNewSession,
  loading,
  error,
  resultsStale,
  plannedRelease,
  targetPrice,
  launchInputError,
  unlockedSteps,
  onNavigate,
  onPlannedReleaseChange,
  onTargetPriceChange,
}: Props) {
  const averageMatch = competitors.length
    ? Math.round(
        (competitors.reduce((sum, c) => sum + c.similarity.score, 0) /
          competitors.length) *
          100,
      )
    : null;
  const knownRevenue = competitors.filter(
    (c) => c.game.commercial.estimatedRevenueUsd.value !== null,
  ).length;
  const medianRevenue = median(
    competitors.map((c) => c.game.commercial.estimatedRevenueUsd.value),
  );
  const medianPrice = median(
    competitors.map((c) => c.game.commercial.priceUsd.value),
  );
  return (
    <WorkspaceShell
      active="comparables"
      unlocked={unlockedSteps}
      onNavigate={onNavigate}
      onStartNewSession={onStartNewSession}
    >
      <header className="ws-page-heading">
        <div>
          <span className="ws-step-caption">Step 2 of 3</span>
          <h1>Your game doesn’t launch alone.</h1>
          <p>
            Meet the games competing for the same players. Review their
            performance, then set the assumptions for your launch analysis.
          </p>
        </div>
        <button type="button" className="ws-button secondary" onClick={onBack}>
          <ArrowLeft size={14} /> Refine selection
        </button>
      </header>
      {resultsStale ? (
        <div className="ws-alert warning">
          These games belong to your previous concept. Approve a new shortlist
          to replace them.
        </div>
      ) : null}
      {error ? (
        <div role="alert" className="ws-alert">
          {error}
        </div>
      ) : null}
      <div className="ws-stat-strip">
        <div className="ws-stat">
          <span>Comparable games</span>
          <strong>{competitors.length.toString().padStart(2, "0")}</strong>
          <small>Approved by you</small>
        </div>
        <div className="ws-stat">
          <span>Average similarity</span>
          <strong>{averageMatch === null ? "—" : `${averageMatch}%`}</strong>
          <small>Semantic + structured evidence</small>
        </div>
        <div className="ws-stat">
          <span>Median gross revenue</span>
          <strong>{compact(medianRevenue, true)}</strong>
          <small>{knownRevenue} available estimates</small>
        </div>
        <div className="ws-stat">
          <span>Median store price</span>
          <strong>{compact(medianPrice, true)}</strong>
          <small>Known Steam prices</small>
        </div>
      </div>
      {loading ? (
        <div className="mb-6">
          <ProcessIndicator kind="analysis" />
        </div>
      ) : null}
      <div className="ws-comparison-grid">
        <section className="ws-panel">
          <div className="ws-panel-head">
            <div>
              <h2>Your comparable set</h2>
              <p>Ordered by gameplay similarity, not commercial success.</p>
            </div>
            <span className="ws-badge blue">
              <Layers3 size={12} /> {competitors.length} games
            </span>
          </div>
          {competitors.length ? (
            competitors.map((competitor) => (
              <ComparableRow
                key={competitor.game.identity.steamAppId}
                competitor={competitor}
              />
            ))
          ) : (
            <div className="ws-empty">
              <Layers3 size={30} />
              <h2>Your market starts with a shortlist.</h2>
              <p>Return to your concept and approve comparable games.</p>
              <button type="button" className="ws-button mt-5" onClick={onBack}>
                Find comparable games
              </button>
            </div>
          )}
        </section>
        <aside className="ws-stack ws-sticky">
          <section className="ws-panel">
            <div className="ws-panel-head">
              <div>
                <h2>Plan your launch</h2>
                <p>A date to evaluate. A price to position.</p>
              </div>
              <CalendarDays size={18} className="ws-muted" />
            </div>
            <div className="ws-panel-body ws-launch-fields">
              <label className="ws-field">
                Planned release
                <input
                  type="date"
                  className="ws-input"
                  value={plannedRelease}
                  onChange={(event) =>
                    onPlannedReleaseChange(event.target.value)
                  }
                  aria-invalid={Boolean(launchInputError)}
                  aria-describedby={
                    launchInputError ? "launch-date-error" : undefined
                  }
                />
              </label>
              {launchInputError ? (
                <p
                  id="launch-date-error"
                  role="alert"
                  className="text-[11px] text-red leading-5"
                >
                  {launchInputError}
                </p>
              ) : null}
              <label className="ws-field">
                Target price (USD)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="ws-input"
                  value={targetPrice ?? ""}
                  onChange={(event) =>
                    onTargetPriceChange(
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  placeholder="Optional"
                />
              </label>
              <p className="ws-muted text-[11px] leading-6">
                {targetPrice === null
                  ? "No price set? We’ll use comparable revenue as reported, without price normalization."
                  : "Revenue estimates will account for your target price where comparable prices are available."}
              </p>
              <button
                type="button"
                className="ws-button"
                onClick={onNext}
                disabled={
                  loading || Boolean(launchInputError) || !competitors.length
                }
              >
                {loading
                  ? "Building your analysis…"
                  : "Build launch intelligence"}
                <ArrowRight size={16} />
              </button>
              <p className="ws-safety-note">
                <ShieldCheck size={15} className="shrink-0 mt-0.5" />
                Your inputs and comparable set are saved on this device.
              </p>
            </div>
          </section>
          <section className="ws-panel">
            <div className="ws-panel-body">
              <div className="flex items-center gap-2 text-[12px] font-medium mb-4">
                <CircleDollarSign size={16} className="text-primary" /> Read the
                evidence clearly
              </div>
              <div className="flex gap-3 items-start mb-4">
                <span className="ws-badge green">Fact</span>
                <p className="text-[11px] ws-muted leading-6">
                  Steam store prices and review counts.
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="ws-badge amber">Estimate</span>
                <p className="text-[11px] ws-muted leading-6">
                  Revenue and copies sold are provider estimates. Missing values
                  stay unavailable.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </WorkspaceShell>
  );
}

"use client";

import { CalendarDays, CircleDollarSign, Gauge, RotateCcw, ShieldCheck, Star } from "lucide-react";
import { ComparableRevenueChart } from "@/components/analysis/ComparableRevenueChart";
import { ExportBar } from "@/components/analysis/ExportBar";
import { LaunchRiskChart } from "@/components/analysis/LaunchRiskChart";
import { PrintReport } from "@/components/analysis/PrintReport";
import { ReleaseCalendar } from "@/components/analysis/ReleaseCalendar";
import StepPills, { type Step } from "@/components/shared/StepPills";
import type { GameConcept, MarketReport, ScoredCompetitor, Snapshot } from "@/lib/domain/types";

interface Props {
  report: MarketReport | null;
  concept: GameConcept | null;
  competitors: ScoredCompetitor[];
  snapshot: Snapshot | null;
  resultsStale: boolean;
  unlockedSteps: Step[];
  onNavigate: (step: Step) => void;
  onStartNewSession: () => void;
}

function Donut({ value, size = 116 }: { value: number; size?: number }) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const positive = (value / 100) * circumference;
  const midpoint = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${value}% predicted positive reviews`}>
      <circle cx={midpoint} cy={midpoint} r={radius} fill="none" stroke="#272a35" strokeWidth={stroke} />
      <circle
        cx={midpoint}
        cy={midpoint}
        r={radius}
        fill="none"
        stroke="#34d399"
        strokeWidth={stroke}
        strokeDasharray={`${positive} ${circumference}`}
        strokeDashoffset={circumference * 0.25}
        strokeLinecap="round"
      />
      <text x={midpoint} y={midpoint} textAnchor="middle" dominantBaseline="middle" className="fill-on-surface font-heading text-[24px] font-semibold">
        {value}%
      </text>
    </svg>
  );
}

function fmt(value: number | null): string {
  if (value === null) return "Unavailable";
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function sentimentLabel(ratio: number): string {
  if (ratio >= 0.95) return "Overwhelmingly Positive";
  if (ratio >= 0.85) return "Very Positive";
  if (ratio >= 0.75) return "Mostly Positive";
  if (ratio >= 0.60) return "Mixed";
  return "Mostly Negative";
}

function verdictTone(decision: MarketReport["verdict"]["decision"]): string {
  if (decision === "KEEP") return "border-green/25 bg-green/10 text-green";
  if (decision === "MOVE") return "border-red/25 bg-red/10 text-red";
  if (decision === "MITIGATE") return "border-yellow/25 bg-yellow/10 text-yellow";
  return "border-outline-variant/30 bg-surface-container-high text-on-surface-variant";
}

function EvidenceMetric({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-primary/25 bg-primary/[0.07]" : "border-outline-variant/20 bg-surface-container"}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
      <p className={`mt-2 font-heading text-[26px] font-semibold tracking-[-0.04em] ${accent ? "text-primary" : "text-on-surface"}`}>{value}</p>
      <p className="mt-1 text-[11px] leading-5 text-on-surface-variant">{detail}</p>
    </div>
  );
}

export default function AnalyticsPhase({
  report,
  concept,
  competitors,
  snapshot,
  resultsStale,
  unlockedSteps,
  onNavigate,
  onStartNewSession,
}: Props) {
  if (!report) {
    return (
      <div className="mx-auto max-w-[1240px] px-6 py-8">
        <StepPills active="launch-window" unlocked={unlockedSteps} onNavigate={onNavigate} />
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-10 text-center">
          <p className="mb-3 text-on-surface-variant">No analysis data is available yet.</p>
          <button type="button" onClick={() => onNavigate("comparables")} className="text-sm text-primary hover:underline">
            Return to comparables
          </button>
        </div>
      </div>
    );
  }

  const positivePercent = report.reception.predictedPositiveRatio === null
    ? null
    : Math.round(report.reception.predictedPositiveRatio * 100);
  const price = concept?.commercial.priceUsd;
  const revenueEvidence = report.revenue.basedOnCount > 0
    ? `${report.revenue.basedOnCount} commercially verified comparables`
    : "No verified commercial comparables";

  return (
    <>
      <div className="screen-report mx-auto max-w-[1240px] px-6 py-8">
        <StepPills active="launch-window" unlocked={unlockedSteps} onNavigate={onNavigate} />

        {resultsStale ? (
          <div className="mb-5 rounded-xl border border-yellow/25 bg-yellow/10 px-4 py-3 text-[13px] text-yellow">
            This memo uses the previous concept inputs. Run the analysis again to refresh it.
          </div>
        ) : null}

        <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              <ShieldCheck size={14} /> Decision intelligence
            </div>
            <h1 className="font-heading text-[32px] font-semibold tracking-[-0.04em] text-on-surface sm:text-[38px]">
              Investment memo
            </h1>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              A traceable commercial outlook built from {competitors.length} relevant games and the live release landscape.
            </p>
          </div>
          {snapshot ? <ExportBar snapshot={snapshot} /> : null}
        </header>

        <section className="mb-5 grid gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container p-5 lg:grid-cols-[1fr_auto] lg:items-center lg:p-7">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">Launch recommendation</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${verdictTone(report.verdict.decision)}`}>
                {report.verdict.decision.replace("_", " ")}
              </span>
              {report.verdict.recommendedDate ? (
                <span className="font-heading text-xl font-semibold text-on-surface">Target {report.verdict.recommendedDate}</span>
              ) : null}
            </div>
            <div className="mt-4 max-w-3xl space-y-1.5">
              {report.verdict.reasoning.map((reason) => (
                <p key={reason} className="text-[13px] leading-5 text-on-surface-variant">{reason}</p>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-outline-variant/20 pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <div className="min-w-[128px]">
              <div className="mb-2 flex items-center gap-2 text-on-surface-variant"><Gauge size={15} /><span className="text-[11px]">Market pressure</span></div>
              <p className="font-heading text-2xl font-semibold text-on-surface">{report.saturation.score}<span className="text-sm text-on-surface-variant">/100</span></p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-on-surface-variant">{report.saturation.band}</p>
            </div>
            <div className="min-w-[128px]">
              <div className="mb-2 flex items-center gap-2 text-on-surface-variant"><CircleDollarSign size={15} /><span className="text-[11px]">Revenue confidence</span></div>
              <p className="font-heading text-2xl font-semibold text-on-surface">{report.revenue.confidence}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-on-surface-variant">{revenueEvidence}</p>
            </div>
          </div>
        </section>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <EvidenceMetric label="Conservative" value={fmt(report.revenue.conservative)} detail="25th percentile outcome" />
          <EvidenceMetric label="Base case" value={fmt(report.revenue.base)} detail="Similarity-weighted median" accent />
          <EvidenceMetric label="Upside" value={fmt(report.revenue.upside)} detail="80th percentile outcome" />
          <EvidenceMetric
            label="Planned price"
            value={price === null || price === undefined ? "Not provided" : `$${price.toFixed(2)}`}
            detail={`Forecast confidence: ${report.revenue.confidence.toLowerCase()}`}
          />
        </div>

        {report.revenue.drivers.length ? (
          <div className="mb-5 flex flex-wrap gap-2">
            {report.revenue.drivers.map((item) => (
              <span key={`${item.label}-${item.detail}`} className="rounded-full border border-outline-variant/20 bg-surface-container-low px-3 py-1.5 text-[10px] text-on-surface-variant">
                {item.detail}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mb-5 grid gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-outline-variant/20 bg-surface-container p-5">
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-semibold text-on-surface">Launch pressure by week</h2>
                <p className="mt-1 text-[11px] text-on-surface-variant">Competitive collision risk across the decision window</p>
              </div>
              <CalendarDays size={18} className="mt-1 text-primary" />
            </div>
            <LaunchRiskChart windows={report.releaseWindows} currentDate={report.verdict.currentDate} recommendedDate={report.verdict.recommendedDate} />
          </section>

          <section className="rounded-2xl border border-outline-variant/20 bg-surface-container p-5">
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-semibold text-on-surface">Comparable revenue evidence</h2>
                <p className="mt-1 text-[11px] text-on-surface-variant">Available estimates, ordered by relevance to the concept</p>
              </div>
              <CircleDollarSign size={18} className="mt-1 text-primary" />
            </div>
            <ComparableRevenueChart competitors={competitors} />
          </section>
        </div>

        <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_280px]">
          <section className="rounded-2xl border border-outline-variant/20 bg-surface-container p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-semibold text-on-surface">Live PC release landscape</h2>
                <p className="mt-1 text-[11px] text-on-surface-variant">
                  {report.releaseData.datedCount} dated and {report.releaseData.undatedCount} timing-uncertain relevant releases
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${report.releaseData.status === "live" ? "bg-green/15 text-green" : "bg-red/15 text-red"}`}>
                {report.releaseData.status === "live" ? "Live market data" : "Data unavailable"}
              </span>
            </div>
            {report.releaseData.issues.length ? (
              <div className="mb-3 rounded-lg border border-yellow/20 bg-yellow/10 px-3 py-2 text-[11px] text-yellow">
                {report.releaseData.issues.join(" ")}
              </div>
            ) : null}
            <ReleaseCalendar windows={report.releaseWindows} currentDate={report.verdict.currentDate} recommendedDate={report.verdict.recommendedDate} />
            {report.undatedReleases.length ? (
              <div className="mt-4 border-t border-outline-variant/20 pt-4">
                <h3 className="mb-2 text-xs font-semibold text-on-surface">Related releases with uncertain timing</h3>
                <div className="flex flex-wrap gap-2">
                  {report.undatedReleases.map((release) => (
                    <span key={release.igdbId} className="rounded-lg border border-outline-variant/20 px-2.5 py-1.5 text-[10px] text-on-surface-variant">
                      <strong className="text-on-surface">{release.name}</strong> · {release.dateLabel} · {release.similarity}% similar
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="flex flex-col items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container p-6 text-center">
            <Star size={18} className="mb-3 text-primary" />
            <h2 className="font-heading text-lg font-semibold text-on-surface">Reception outlook</h2>
            {positivePercent === null ? (
              <p className="py-8 text-sm leading-6 text-on-surface-variant">Insufficient review evidence for a responsible prediction.</p>
            ) : (
              <>
                <div className="my-5"><Donut value={positivePercent} /></div>
                <p className="text-sm font-semibold text-on-surface">{sentimentLabel(report.reception.predictedPositiveRatio!)}</p>
              </>
            )}
            <p className="mt-3 text-xs text-on-surface-variant">
              Cohort median: {report.reception.cohortMedian === null ? "Unavailable" : `${Math.round(report.reception.cohortMedian * 100)}%`}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-on-surface-variant">{report.reception.band} confidence</p>
          </section>
        </div>

        <div className="flex justify-center pt-4">
          <button type="button" onClick={onStartNewSession} className="flex items-center gap-2 text-xs text-on-surface-variant transition-colors hover:text-on-surface">
            <RotateCcw size={14} /> Start a new analysis
          </button>
        </div>
      </div>
      {snapshot ? <PrintReport snapshot={snapshot} /> : null}
    </>
  );
}

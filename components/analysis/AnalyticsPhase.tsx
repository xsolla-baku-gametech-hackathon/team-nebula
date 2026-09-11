"use client";

import { ArrowLeft, CalendarDays, CheckCircle2, CircleDollarSign, Gauge, RotateCcw, ShieldCheck, Star, TrendingUp } from "lucide-react";
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

function Donut({ value, size = 100 }: { value: number; size?: number }) {
  const s = 8, r = (size - s) / 2, c = 2 * Math.PI * r, g = (value / 100) * c, mid = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${value}% positive`}>
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#272a35" strokeWidth={s} />
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#34d399" strokeWidth={s} strokeDasharray={`${g} ${c}`} strokeDashoffset={c * 0.25} strokeLinecap="round" />
      <text x={mid} y={mid} textAnchor="middle" dominantBaseline="middle" className="fill-on-surface font-heading text-[22px] font-semibold">{value}%</text>
    </svg>
  );
}

function fmt(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${Math.round(v).toLocaleString("en-US")}`;
}

function fmtRange(low: number | null, high: number | null): string {
  if (low === null || high === null) return "—";
  return `${fmt(low)} – ${fmt(high)}`;
}

function sentimentLabel(r: number): string {
  if (r >= 0.95) return "Overwhelmingly Positive";
  if (r >= 0.85) return "Very Positive";
  if (r >= 0.75) return "Mostly Positive";
  if (r >= 0.60) return "Mixed";
  return "Mostly Negative";
}

function verdictColor(d: string) {
  if (d === "KEEP") return { bg: "bg-green/15", text: "text-green", border: "border-green/25", icon: "text-green" };
  if (d === "MOVE") return { bg: "bg-yellow/15", text: "text-yellow", border: "border-yellow/25", icon: "text-yellow" };
  if (d === "MITIGATE") return { bg: "bg-red/15", text: "text-red", border: "border-red/25", icon: "text-red" };
  return { bg: "bg-surface-container-high", text: "text-on-surface-variant", border: "border-outline-variant/30", icon: "text-on-surface-variant" };
}

function verdictDescription(d: string): string {
  if (d === "KEEP") return "Strong market opportunity with manageable risks.";
  if (d === "MOVE") return "Consider shifting your launch window to reduce competitive pressure.";
  if (d === "MITIGATE") return "Proceed with caution — take steps to reduce collision risk.";
  return "Insufficient data to make a confident recommendation.";
}

export default function AnalyticsPhase({ report, concept, competitors, snapshot, resultsStale, unlockedSteps, onNavigate, onStartNewSession }: Props) {
  if (!report) {
    return (
      <div className="mx-auto max-w-[1320px] px-6 py-8">
        <StepPills active="launch-window" unlocked={unlockedSteps} onNavigate={onNavigate} />
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-10 text-center">
          <p className="mb-3 text-on-surface-variant">No analysis data is available yet.</p>
          <button type="button" onClick={() => onNavigate("comparables")} className="text-sm text-primary hover:underline">Return to comparables</button>
        </div>
      </div>
    );
  }

  const vc = verdictColor(report.verdict.decision);
  const positivePercent = report.reception.predictedPositiveRatio !== null ? Math.round(report.reception.predictedPositiveRatio * 100) : null;
  const price = concept?.commercial.priceUsd;
  const recommendedQ = report.verdict.recommendedDate ? `Q${Math.ceil((new Date(report.verdict.recommendedDate).getMonth() + 1) / 3)} ${new Date(report.verdict.recommendedDate).getFullYear()}` : null;

  return (
    <>
      <div className="screen-report mx-auto max-w-[1320px] px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <StepPills active="launch-window" unlocked={unlockedSteps} onNavigate={onNavigate} />
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onNavigate("comparables")} className="h-8 px-3 rounded-lg border border-outline-variant/30 text-on-surface-variant text-[12px] hover:bg-surface-container transition-colors flex items-center gap-1">
              <ArrowLeft size={14} /> Back
            </button>
            {snapshot && <ExportBar snapshot={snapshot} />}
            <button type="button" onClick={onStartNewSession} className="h-8 px-3 rounded-lg border border-outline-variant/30 text-on-surface-variant text-[12px] hover:bg-surface-container transition-colors flex items-center gap-1">
              <RotateCcw size={14} /> New Analysis
            </button>
          </div>
        </div>

        {resultsStale && (
          <div className="mb-4 rounded-xl border border-yellow/25 bg-yellow/10 px-4 py-3 text-[13px] text-yellow">
            This memo uses the previous concept inputs. Run the analysis again to refresh it.
          </div>
        )}

        {/* Verdict Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5 mb-6">
          <div className={`rounded-xl border ${vc.border} ${vc.bg} p-6 flex flex-col items-center justify-center text-center min-w-[200px]`}>
            <CheckCircle2 size={40} className={vc.icon} />
            <p className={`font-heading text-[48px] font-bold mt-2 ${vc.text}`}>{report.verdict.decision.replace("_", " ")}</p>
            <p className="text-[13px] text-on-surface-variant mt-1 max-w-[240px]">{verdictDescription(report.verdict.decision)}</p>
          </div>
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5 flex items-center">
            <blockquote className="text-[15px] leading-relaxed text-on-surface italic">
              &ldquo;{report.verdict.reasoning[0] ?? "Analysis complete."}&rdquo;
              {report.verdict.reasoning.length > 1 && (
                <footer className="mt-2 text-[12px] text-on-surface-variant not-italic">
                  {report.verdict.reasoning.slice(1).join(" ")}
                </footer>
              )}
            </blockquote>
          </div>
        </div>

        {/* 5-metric row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4">
            <p className="text-[11px] text-on-surface-variant flex items-center gap-1"><Gauge size={12} /> Overall Score</p>
            <p className="font-heading text-[28px] font-bold text-primary mt-1">{report.saturation.score}</p>
            <p className="text-[11px] text-on-surface-variant">(out of 100)</p>
          </div>
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4">
            <p className="text-[11px] text-on-surface-variant flex items-center gap-1"><CircleDollarSign size={12} /> Est. Revenue (base)</p>
            <p className="font-heading text-[28px] font-bold text-on-surface mt-1">{fmt(report.revenue.base)}</p>
            <p className="text-[11px] text-on-surface-variant">{fmtRange(report.revenue.conservative, report.revenue.upside)} range</p>
          </div>
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4">
            <p className="text-[11px] text-on-surface-variant flex items-center gap-1"><TrendingUp size={12} /> Market Saturation</p>
            <p className="font-heading text-[28px] font-bold text-on-surface mt-1">{report.saturation.band}</p>
            <p className="text-[11px] text-on-surface-variant">{report.saturation.drivers[0]?.detail ?? "No details"}</p>
          </div>
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4">
            <p className="text-[11px] text-on-surface-variant flex items-center gap-1"><Star size={12} /> Player Reception</p>
            <p className="font-heading text-[28px] font-bold text-on-surface mt-1">{positivePercent !== null ? `${positivePercent}%` : "—"}</p>
            <p className="text-[11px] text-on-surface-variant">Similar games</p>
          </div>
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4">
            <p className="text-[11px] text-on-surface-variant flex items-center gap-1"><CalendarDays size={12} /> Recommended Launch</p>
            <p className="font-heading text-[28px] font-bold text-on-surface mt-1">{recommendedQ ?? report.verdict.currentDate?.slice(0, 7) ?? "—"}</p>
            <p className="text-[11px] text-on-surface-variant">Lower competition</p>
          </div>
        </div>

        {/* 3 analysis panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Revenue Forecast */}
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5">
            <h3 className="font-heading text-[15px] font-semibold text-on-surface mb-1">Revenue Forecast</h3>
            <p className="font-heading text-[22px] font-bold text-on-surface">{fmtRange(report.revenue.conservative, report.revenue.upside)}</p>
            <div className="mt-3 space-y-1.5 text-[12px]">
              <div className="flex justify-between"><span className="text-on-surface-variant">High Estimate</span><span className="text-on-surface font-medium">{fmt(report.revenue.upside)}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Base Estimate</span><span className="text-primary font-medium">{fmt(report.revenue.base)}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">Low Estimate</span><span className="text-on-surface font-medium">{fmt(report.revenue.conservative)}</span></div>
            </div>
            <div className="mt-3">
              <ComparableRevenueChart competitors={competitors} />
            </div>
          </div>

          {/* Market Saturation */}
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5">
            <h3 className="font-heading text-[15px] font-semibold text-on-surface mb-1">Market Saturation</h3>
            <div className="flex items-center gap-3 mt-2">
              <div className="relative w-16 h-16">
                <svg width={64} height={64} viewBox="0 0 64 64">
                  <circle cx={32} cy={32} r={26} fill="none" stroke="#272a35" strokeWidth={6} />
                  <circle cx={32} cy={32} r={26} fill="none" stroke={report.saturation.score < 40 ? "#34d399" : report.saturation.score < 70 ? "#fbbf24" : "#f87171"} strokeWidth={6} strokeDasharray={`${(report.saturation.score / 100) * 163} 163`} strokeDashoffset={163 * 0.25} strokeLinecap="round" />
                  <text x={32} y={32} textAnchor="middle" dominantBaseline="middle" className="fill-on-surface font-heading text-[14px] font-bold">{report.saturation.score}</text>
                </svg>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-on-surface">{report.saturation.band}</p>
                <p className="text-[12px] text-on-surface-variant mt-0.5">{report.saturation.drivers[0]?.detail ?? ""}</p>
              </div>
            </div>
            <div className="mt-4">
              <LaunchRiskChart windows={report.releaseWindows} currentDate={report.verdict.currentDate} recommendedDate={report.verdict.recommendedDate} />
            </div>
          </div>

          {/* Player Reception */}
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5">
            <h3 className="font-heading text-[15px] font-semibold text-on-surface mb-1">Player Reception</h3>
            {positivePercent !== null ? (
              <div className="flex flex-col items-center mt-3">
                <Donut value={positivePercent} />
                <p className="text-[14px] font-semibold text-on-surface mt-2">{sentimentLabel(report.reception.predictedPositiveRatio!)}</p>
                <p className="text-[12px] text-on-surface-variant mt-1">Similar games receive positive reviews on average.</p>
                <p className="text-[11px] text-on-surface-variant mt-2">
                  Cohort median: {report.reception.cohortMedian !== null ? `${Math.round(report.reception.cohortMedian * 100)}%` : "—"}
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-on-surface-variant py-6 text-center">Insufficient review evidence.</p>
            )}
          </div>
        </div>

        {/* Launch Timing + Upcoming Releases + Key Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Launch Timing Analysis */}
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5">
            <h3 className="font-heading text-[15px] font-semibold text-on-surface mb-3">Launch Timing Analysis</h3>
            <ReleaseCalendar windows={report.releaseWindows} currentDate={report.verdict.currentDate} recommendedDate={report.verdict.recommendedDate} />
            {report.verdict.recommendedDate && (
              <p className="mt-3 text-[12px] text-green flex items-center gap-1">
                <CheckCircle2 size={12} /> Recommended: {report.verdict.recommendedDate} — Lower competition, higher chance of visibility.
              </p>
            )}
          </div>

          {/* Major Upcoming Releases */}
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5">
            <h3 className="font-heading text-[15px] font-semibold text-on-surface mb-3">Major Upcoming Releases</h3>
            {report.undatedReleases?.length ? (
              <div className="space-y-2">
                {report.undatedReleases.slice(0, 6).map((r) => (
                  <div key={r.igdbId} className="flex items-center justify-between text-[12px]">
                    <span className="text-on-surface-variant">{r.dateLabel ?? "TBD"}</span>
                    <span className="text-on-surface font-medium">{r.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-on-surface-variant">No major upcoming competitive releases detected.</p>
            )}
          </div>

          {/* Key Insights */}
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-5">
            <h3 className="font-heading text-[15px] font-semibold text-on-surface mb-3">Key Insights</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[12px] font-semibold text-on-surface flex items-center gap-1"><ShieldCheck size={12} className="text-green" /> Market Opportunity</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{report.saturation.band} saturation in the {concept?.taxonomy.primaryGenre ?? "target"} niche</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-on-surface flex items-center gap-1"><CircleDollarSign size={12} className="text-primary" /> Revenue Potential</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{fmtRange(report.revenue.conservative, report.revenue.upside)} estimated revenue range</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-on-surface flex items-center gap-1"><Star size={12} className="text-yellow" /> Positive Reception</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{positivePercent ?? "—"}% average review score for similar games</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-on-surface flex items-center gap-1"><CalendarDays size={12} className="text-green" /> Launch Window</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{recommendedQ ?? "Current date"} recommended for lower competition</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {snapshot && <PrintReport snapshot={snapshot} />}
    </>
  );
}

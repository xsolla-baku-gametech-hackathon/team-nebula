"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ExportBar } from "@/components/forecast/ExportBar";
import { PrintReport } from "@/components/forecast/PrintReport";
import { ReleaseCalendar } from "@/components/forecast/ReleaseCalendar";
import StepPills, { type Step } from "@/components/phases/StepPills";
import type { GameConcept, MarketReport, ScoredCompetitor, Snapshot } from "@/lib/types";

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

function Donut({ value, size = 120 }: { value: number; size?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const positive = (value / 100) * circumference;
  const midpoint = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={midpoint} cy={midpoint} r={radius} fill="none" stroke="#22242f" strokeWidth={stroke} />
      <circle cx={midpoint} cy={midpoint} r={radius} fill="none" stroke="#34d399" strokeWidth={stroke} strokeDasharray={`${positive} ${circumference}`} strokeDashoffset={circumference * 0.25} strokeLinecap="round" />
      <circle cx={midpoint} cy={midpoint} r={radius} fill="none" stroke="#f87171" strokeWidth={stroke} strokeDasharray={`${circumference - positive} ${circumference}`} strokeDashoffset={-(positive - circumference * 0.25)} strokeLinecap="round" />
      <text x={midpoint} y={midpoint} textAnchor="middle" dominantBaseline="middle" className="fill-on-surface font-heading text-[24px] font-bold">{value}%</text>
    </svg>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4">
      <span className="text-[11px] text-on-surface-variant font-mono uppercase tracking-wide">{label}</span>
      <p className="font-heading text-[24px] font-bold text-on-surface leading-tight mt-1">{value}</p>
      {sub ? <p className="text-[11px] text-on-surface-variant mt-0.5">{sub}</p> : null}
    </div>
  );
}

function fmt(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function sentimentLabel(ratio: number): string {
  if (ratio >= 0.95) return "Overwhelmingly Positive";
  if (ratio >= 0.85) return "Very Positive";
  if (ratio >= 0.75) return "Mostly Positive";
  if (ratio >= 0.60) return "Mixed";
  return "Mostly Negative";
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
      <div className="max-w-[1200px] mx-auto px-6 py-5">
        <StepPills active="launch-window" unlocked={unlockedSteps} onNavigate={onNavigate} />
        <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-8 text-center">
          <p className="text-on-surface-variant mb-3">No analysis data is available yet.</p>
          <button type="button" onClick={() => onNavigate("comparables")} className="text-primary text-[13px] hover:underline">Return to comparables</button>
        </div>
      </div>
    );
  }

  const saturationData = report.releaseWindows.map((window, index) => ({
    week: `W${index + 1}`,
    risk: Math.round(window.risk),
  }));
  const positivePercent = Math.round(report.reception.predictedPositiveRatio * 100);
  const price = concept?.commercial.priceUsd;

  return (
    <>
      <main className="screen-report max-w-[1200px] mx-auto px-6 py-5">
        <StepPills active="launch-window" unlocked={unlockedSteps} onNavigate={onNavigate} />

        {resultsStale ? (
          <div className="rounded-xl border border-yellow/30 bg-yellow/10 px-4 py-3 mb-4 text-[13px] text-yellow">
            This report uses the previous concept inputs. Run predictions again to refresh it.
          </div>
        ) : null}

        <div className="flex items-baseline justify-between gap-4 mb-5">
          <div>
            <h1 className="font-heading text-[24px] font-semibold text-on-surface">Analytics</h1>
            <p className="text-[13px] text-on-surface-variant">Based on {competitors.length} comparable games · {report.revenue.method}</p>
          </div>
          {snapshot ? <ExportBar snapshot={snapshot} /> : null}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <MetricCard label="Conservative" value={fmt(report.revenue.conservative)} sub="25th percentile" />
          <MetricCard label="Base estimate" value={fmt(report.revenue.base)} sub="50th percentile" />
          <MetricCard label="Upside" value={fmt(report.revenue.upside)} sub="80th percentile" />
          <MetricCard label="Price point" value={price === null || price === undefined ? "$14.99*" : `$${price.toFixed(2)}`} sub={`Confidence: ${report.revenue.confidence}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4">
            <h2 className="text-[14px] font-semibold text-on-surface mb-1">Launch pressure</h2>
            <p className="text-[11px] text-on-surface-variant mb-3">{report.saturation.band} market saturation ({report.saturation.score}/100)</p>
            {saturationData.length ? (
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={saturationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#363842" />
                  <XAxis dataKey="week" tick={{ fill: "#9da0ab", fontSize: 10 }} axisLine={{ stroke: "#363842" }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#9da0ab", fontSize: 10 }} axisLine={{ stroke: "#363842" }} />
                  <Tooltip contentStyle={{ background: "#1a1c26", border: "1px solid #363842", borderRadius: 6, color: "#e8e9ed", fontSize: 11 }} />
                  <Line type="monotone" dataKey="risk" stroke="#6c8cff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>

          <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4 flex flex-col items-center justify-center text-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">calendar_today</span>
            <h2 className="text-[14px] font-semibold text-on-surface">Release verdict</h2>
            <span className={`px-3 py-1 rounded-lg text-[14px] font-bold ${
              report.verdict.decision === "KEEP" ? "bg-green/15 text-green" :
              report.verdict.decision === "MOVE" ? "bg-red/15 text-red" :
              report.verdict.decision === "MITIGATE" ? "bg-yellow/15 text-yellow" : "bg-outline-variant/30 text-on-surface-variant"
            }`}>{report.verdict.decision.replace("_", " ")}</span>
            {report.verdict.recommendedDate ? <p className="font-heading text-[18px] font-bold text-on-surface">{report.verdict.recommendedDate}</p> : null}
            {report.verdict.reasoning.map((reason) => <p key={reason} className="text-[11px] text-on-surface-variant leading-snug">{reason}</p>)}
          </div>

          <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4 flex flex-col items-center justify-center text-center gap-2">
            <h2 className="text-[14px] font-semibold text-on-surface">Predicted reviews</h2>
            <Donut value={positivePercent} />
            <p className="text-[14px] font-semibold text-on-surface">{sentimentLabel(report.reception.predictedPositiveRatio)}</p>
            <p className="text-[12px] text-on-surface-variant">Cohort median: {Math.round(report.reception.cohortMedian * 100)}%</p>
            <p className="text-[11px] text-on-surface-variant">Confidence: {report.reception.band}</p>
          </div>
        </div>

        <section className="rounded-xl bg-surface-container border border-outline-variant/20 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[16px] font-semibold text-on-surface">Live upcoming PC releases</h2>
              <p className="text-[11px] text-on-surface-variant mt-1">IGDB MCP · {report.releaseData.datedCount} dated and {report.releaseData.undatedCount} undated matches</p>
            </div>
            <span className={`px-2 py-1 rounded-md text-[10px] font-mono ${report.releaseData.status === "live" ? "bg-green/15 text-green" : "bg-red/15 text-red"}`}>
              {report.releaseData.status === "live" ? "LIVE DATA" : "DATA UNAVAILABLE"}
            </span>
          </div>
          {report.releaseData.issues.length ? (
            <div className="rounded-lg bg-yellow/10 border border-yellow/20 px-3 py-2 mb-3 text-[11px] text-yellow">
              {report.releaseData.issues.join(" ")}
            </div>
          ) : null}
          <ReleaseCalendar windows={report.releaseWindows} currentDate={report.verdict.currentDate} recommendedDate={report.verdict.recommendedDate} />
          {report.undatedReleases.length ? (
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <h3 className="text-[12px] font-semibold text-on-surface mb-2">Related releases with uncertain timing</h3>
              <div className="flex flex-wrap gap-2">
                {report.undatedReleases.map((release) => (
                  <span key={release.igdbId} className="rounded-lg border border-outline-variant/20 px-2.5 py-1.5 text-[10px] text-on-surface-variant">
                    <strong className="text-on-surface">{release.name}</strong> · {release.dateLabel} · {Math.round(release.similarity * 100)}% similar
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <div className="flex justify-center mt-8">
          <button type="button" onClick={onStartNewSession} className="text-on-surface-variant hover:text-on-surface text-[12px] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">restart_alt</span> New session
          </button>
        </div>
      </main>
      {snapshot ? <PrintReport snapshot={snapshot} /> : null}
    </>
  );
}

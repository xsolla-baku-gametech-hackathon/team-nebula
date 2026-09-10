"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StepPills from "@/components/phases/StepPills";
import type { MarketReport, GameConcept, ScoredCompetitor } from "@/lib/types";

interface Props {
  report: MarketReport | null;
  concept: GameConcept | null;
  competitors: ScoredCompetitor[];
  onStartNewSession: () => void;
}

function Donut({ value, size = 120 }: { value: number; size?: number }) {
  const s = 10, r = (size - s) / 2, c = 2 * Math.PI * r, g = (value / 100) * c, mid = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#22242f" strokeWidth={s} />
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#34d399" strokeWidth={s} strokeDasharray={`${g} ${c}`} strokeDashoffset={c * 0.25} strokeLinecap="round" />
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#f87171" strokeWidth={s} strokeDasharray={`${c - g} ${c}`} strokeDashoffset={-(g - c * 0.25)} strokeLinecap="round" />
      <text x={mid} y={mid} textAnchor="middle" dominantBaseline="middle" className="fill-on-surface font-heading text-[24px] font-bold">{value}%</text>
    </svg>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4">
      <span className="text-[11px] text-on-surface-variant font-mono uppercase tracking-wide">{label}</span>
      <p className="font-heading text-[24px] font-bold text-on-surface leading-tight mt-1">{value}</p>
      {sub && <p className="text-[11px] text-on-surface-variant mt-0.5">{sub}</p>}
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function sentimentLabel(ratio: number): string {
  if (ratio >= 0.95) return "Overwhelmingly Positive";
  if (ratio >= 0.85) return "Very Positive";
  if (ratio >= 0.75) return "Mostly Positive";
  if (ratio >= 0.60) return "Mixed";
  return "Mostly Negative";
}

export default function AnalyticsPhase({ report, concept, competitors, onStartNewSession }: Props) {
  if (!report) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-5">
        <StepPills active="launch-window" />
        <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-8 text-center text-on-surface-variant">
          No analysis data available. Go back and run the analysis.
        </div>
      </div>
    );
  }

  const satData = report.releaseWindows.map((w, i) => ({
    week: `W${i + 1}`,
    risk: Math.round(w.risk * 100),
  }));

  const positivePercent = Math.round(report.reception.predictedPositiveRatio * 100);
  const price = concept?.commercial.priceUsd;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-5">
      <StepPills active="launch-window" />

      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h1 className="font-heading text-[24px] font-semibold text-on-surface">Analytics</h1>
          <p className="text-[13px] text-on-surface-variant">Based on {competitors.length} comparable games &middot; {report.revenue.method}</p>
        </div>
        <div className="flex gap-2">
          <button className="h-9 px-4 rounded-lg border border-outline-variant/30 text-on-surface text-[13px] font-medium hover:bg-surface-container transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span> PDF
          </button>
          <button className="h-9 px-4 rounded-lg border border-outline-variant/30 text-on-surface text-[13px] font-medium hover:bg-surface-container transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">data_object</span> JSON
          </button>
        </div>
      </div>

      {/* Revenue metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Conservative" value={fmt(report.revenue.conservative)} sub="25th percentile" />
        <MetricCard label="Base estimate" value={fmt(report.revenue.base)} sub="50th percentile" />
        <MetricCard label="Upside" value={fmt(report.revenue.upside)} sub="80th percentile" />
        <MetricCard label="Price point" value={price ? `$${price.toFixed(2)}` : "—"} sub={`Confidence: ${report.revenue.confidence}`} />
      </div>

      {/* 3 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        {/* Saturation */}
        <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4">
          <h3 className="text-[14px] font-semibold text-on-surface mb-1">Market saturation</h3>
          <p className="text-[11px] text-on-surface-variant mb-3">
            {report.saturation.band} ({report.saturation.score}/100)
            {report.saturation.drivers[0] && ` — ${report.saturation.drivers[0].detail}`}
          </p>
          {satData.length > 0 && (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={satData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#363842" />
                <XAxis dataKey="week" tick={{ fill: "#9da0ab", fontSize: 10 }} axisLine={{ stroke: "#363842" }} />
                <YAxis tick={{ fill: "#9da0ab", fontSize: 10 }} axisLine={{ stroke: "#363842" }} />
                <Tooltip contentStyle={{ background: "#1a1c26", border: "1px solid #363842", borderRadius: 6, color: "#e8e9ed", fontSize: 11 }} />
                <Line type="monotone" dataKey="risk" stroke="#6c8cff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Release window */}
        <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4 flex flex-col items-center justify-center text-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]">calendar_today</span>
          <h3 className="text-[14px] font-semibold text-on-surface">Release verdict</h3>
          <span className={`px-3 py-1 rounded-lg text-[14px] font-bold ${
            report.verdict.decision === "KEEP" ? "bg-green/15 text-green" :
            report.verdict.decision === "MOVE" ? "bg-red/15 text-red" :
            "bg-yellow/15 text-yellow"
          }`}>
            {report.verdict.decision}
          </span>
          {report.verdict.recommendedDate && (
            <p className="font-heading text-[18px] font-bold text-on-surface">{report.verdict.recommendedDate}</p>
          )}
          {report.verdict.reasoning.map((r, i) => (
            <p key={i} className="text-[11px] text-on-surface-variant leading-snug">{r}</p>
          ))}
        </div>

        {/* Sentiment */}
        <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4 flex flex-col items-center justify-center text-center gap-2">
          <h3 className="text-[14px] font-semibold text-on-surface">Predicted reviews</h3>
          <Donut value={positivePercent} />
          <p className="text-[14px] font-semibold text-on-surface">{sentimentLabel(report.reception.predictedPositiveRatio)}</p>
          <p className="text-[12px] text-on-surface-variant">Cohort median: {Math.round(report.reception.cohortMedian * 100)}%</p>
          <p className="text-[11px] text-on-surface-variant">Confidence: {report.reception.band}</p>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button onClick={onStartNewSession} className="text-on-surface-variant hover:text-on-surface text-[12px] transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">restart_alt</span> New session
        </button>
      </div>
    </div>
  );
}

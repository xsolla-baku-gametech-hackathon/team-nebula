"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StepPills from "@/components/phases/StepPills";
import {
  PREDICTION_REVENUE,
  PREDICTION_RELEASE_WINDOW,
  PREDICTION_SENTIMENT,
  PREDICTION_SATURATION,
  PREDICTION_SUCCESS,
} from "@/lib/mock-data";

interface Props {
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

const r = PREDICTION_REVENUE;
const w = PREDICTION_RELEASE_WINDOW;
const sent = PREDICTION_SENTIMENT;
const sat = PREDICTION_SATURATION;
const suc = PREDICTION_SUCCESS;

export default function AnalyticsPhase({ onStartNewSession }: Props) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-5">
      <StepPills active="launch-window" />

      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h1 className="font-heading text-[24px] font-semibold text-on-surface">Analytics</h1>
          <p className="text-[13px] text-on-surface-variant">Predicted performance based on comparables and market data</p>
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

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <MetricCard label="Est. Revenue" value={r.estRevenue} />
        <MetricCard label="Est. Copies" value={r.estCopies} />
        <MetricCard label="Best Price" value={r.bestPrice} />
        <MetricCard label="Avg Price" value={r.avgPrice} />
      </div>

      {/* 3 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        {/* Saturation */}
        <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4">
          <h3 className="text-[14px] font-semibold text-on-surface mb-1">Market saturation</h3>
          <p className="text-[11px] text-on-surface-variant mb-3">{sat.insight}</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={sat.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#363842" />
              <XAxis dataKey="week" tick={{ fill: "#9da0ab", fontSize: 10 }} axisLine={{ stroke: "#363842" }} />
              <YAxis tick={{ fill: "#9da0ab", fontSize: 10 }} axisLine={{ stroke: "#363842" }} />
              <Tooltip contentStyle={{ background: "#1a1c26", border: "1px solid #363842", borderRadius: 6, color: "#e8e9ed", fontSize: 11 }} />
              <Line type="monotone" dataKey="releases" stroke="#6c8cff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-2 text-[11px] text-on-surface-variant">
            <span>Competing releases / week</span>
            <span className="font-medium text-on-surface">{sat.level} ({sat.score}/100)</span>
          </div>
        </div>

        {/* Release window */}
        <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4 flex flex-col items-center justify-center text-center gap-2">
          <span className="material-symbols-outlined text-primary text-[28px]">calendar_today</span>
          <h3 className="text-[14px] font-semibold text-on-surface">Best release window</h3>
          <p className="font-heading text-[20px] font-bold text-on-surface">{w.bestWeek}</p>
          <p className="text-[12px] text-on-surface-variant">Week {w.weekNumber} &middot; {w.year}</p>
          <span className="px-3 py-1 rounded-lg bg-green/15 text-green text-[12px] font-semibold">{w.verdict}</span>
          <p className="text-[11px] text-on-surface-variant leading-snug">{w.reason}</p>
        </div>

        {/* Sentiment */}
        <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4 flex flex-col items-center justify-center text-center gap-2">
          <h3 className="text-[14px] font-semibold text-on-surface">Predicted reviews</h3>
          <Donut value={sent.positivePercent} />
          <p className="text-[14px] font-semibold text-on-surface">{sent.label}</p>
          <p className="text-[12px] text-on-surface-variant">~{sent.estReviewCount} reviews</p>
          <p className="text-[11px] text-on-surface-variant/70 leading-snug">{sent.reasoning}</p>
        </div>
      </div>

      {/* Success rate */}
      <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-5 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-on-surface-variant font-mono uppercase tracking-wide">Success rate</span>
          <p className="font-heading text-[40px] font-bold text-on-surface leading-tight">
            {suc.percent}<span className="text-primary">%</span>
          </p>
          <p className="text-[13px] text-on-surface-variant mt-1">{suc.label} — {suc.reasoning}</p>
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

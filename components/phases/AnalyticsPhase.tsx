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

function Donut({ positive, size = 150 }: { positive: number; size?: number }) {
  const s = 14, r = (size - s) / 2, c = 2 * Math.PI * r, g = (positive / 100) * c, red = c - g, mid = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#292935" strokeWidth={s} />
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#3FB37C" strokeWidth={s} strokeDasharray={`${g} ${c}`} strokeDashoffset={c * 0.25} strokeLinecap="round" />
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#D9534F" strokeWidth={s} strokeDasharray={`${red} ${c}`} strokeDashoffset={-(g - c * 0.25)} strokeLinecap="round" />
      <text x={mid} y={mid + 2} textAnchor="middle" dominantBaseline="middle" className="fill-on-surface font-heading text-[32px] font-bold">{positive}%</text>
    </svg>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-[#D9D9DE]/90 border-t border-white/70">
      <span className="text-[11px] text-[#6E6E7C] font-mono uppercase tracking-wider">{label}</span>
      <span className="font-heading text-[26px] font-bold text-[#1E1E2A] leading-none">{value}</span>
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
    <div className="max-w-[1000px] mx-auto px-8 py-8 relative">
      <StepPills active="launch-window" />

      <h1 className="font-heading text-[32px] font-bold text-white tracking-tight mb-1">Analytics</h1>
      <p className="text-[15px] text-on-surface-variant mb-8">Predicted performance based on your comparables and market conditions.</p>

      {/* Service 1: Revenue / copies / cost */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Metric label="Est. Revenue" value={r.estRevenue} />
        <Metric label="Est. Copies" value={r.estCopies} />
        <Metric label="Best Price" value={r.bestPrice} />
        <Metric label="Avg Price" value={r.avgPrice} />
      </div>

      {/* Row: Saturation + Release Window + Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Service 4: Market saturation */}
        <div className="rounded-xl bg-[#D9D9DE]/90 border-t border-white/70 p-5 shadow-md">
          <h3 className="font-heading text-[16px] font-bold text-[#1E1E2A] mb-1">Market saturation</h3>
          <p className="text-[12px] text-[#6E6E7C] mb-3">{sat.insight}</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={sat.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#B0B0B8" />
              <XAxis dataKey="week" tick={{ fill: "#6E6E7C", fontSize: 10 }} axisLine={{ stroke: "#6E6E7C" }} />
              <YAxis tick={{ fill: "#6E6E7C", fontSize: 10 }} axisLine={{ stroke: "#6E6E7C" }} />
              <Tooltip contentStyle={{ background: "#1E1E2A", border: "none", borderRadius: 8, color: "#E3E0F1", fontSize: 12 }} />
              <Line type="monotone" dataKey="releases" stroke="#1E1E2A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-[#6E6E7C]">Co-op horror releases per week</span>
            <span className="text-[12px] font-semibold text-[#1E1E2A]">{sat.level} ({sat.score}/100)</span>
          </div>
        </div>

        {/* Service 2: Release window */}
        <div className="rounded-xl bg-[#D9D9DE]/90 border-t border-white/70 p-5 shadow-md flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[36px] text-[#4354B4]">calendar_today</span>
          <h3 className="font-heading text-[16px] font-bold text-[#1E1E2A]">Best release window</h3>
          <p className="font-heading text-[22px] font-bold text-[#1E1E2A] text-center">{w.bestWeek}</p>
          <p className="text-[13px] text-[#6E6E7C]">Week {w.weekNumber} &middot; {w.year}</p>
          <div className="px-4 py-1.5 rounded-lg bg-[#3FB37C] text-white font-heading text-[13px] font-bold tracking-wider">{w.verdict}</div>
          <p className="text-[11px] text-[#6E6E7C] text-center leading-snug mt-1">{w.reason}</p>
        </div>

        {/* Service 3: Sentiment / reviews */}
        <div className="rounded-xl bg-surface-container-lowest/60 border border-outline-variant/30 p-5 shadow-md flex flex-col items-center justify-center gap-2">
          <h3 className="font-heading text-[16px] font-bold text-on-surface">Predicted reviews</h3>
          <Donut positive={sent.positivePercent} />
          <p className="font-heading text-[15px] font-semibold text-on-surface">{sent.label}</p>
          <p className="text-[12px] text-on-surface-variant">~{sent.estReviewCount} reviews expected</p>
          <p className="text-[11px] text-on-surface-variant/70 text-center leading-snug mt-1">{sent.reasoning}</p>
        </div>
      </div>

      {/* Service 6: Success % + Exports */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-heading text-[48px] font-bold text-white tracking-tighter leading-[1]">
            Success rate: <span className="text-[#E0D438]">{suc.percent}%</span>
          </h2>
          <p className="text-[14px] text-on-surface-variant mt-2">{suc.label} — {suc.reasoning}</p>
        </div>

        {/* Service 7 + 8: Exporters */}
        <div className="flex gap-3">
          <button className="h-[44px] px-5 rounded-xl bg-primary-container hover:bg-inverse-primary text-white font-heading text-[14px] font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF
          </button>
          <button className="h-[44px] px-5 rounded-xl bg-primary-container hover:bg-inverse-primary text-white font-heading text-[14px] font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">data_object</span> Export JSON
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <button onClick={onStartNewSession} className="text-on-surface-variant hover:text-on-surface text-[13px] transition-colors flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          Start new session
        </button>
      </div>
    </div>
  );
}

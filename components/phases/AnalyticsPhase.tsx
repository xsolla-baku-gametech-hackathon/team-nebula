"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StepPills from "@/components/phases/StepPills";

interface Props {
  onStartNewSession: () => void;
}

const MARKET_DATA = [
  { week: "W36", releases: 42 }, { week: "W37", releases: 38 }, { week: "W38", releases: 55 },
  { week: "W39", releases: 31 }, { week: "W40", releases: 48 }, { week: "W41", releases: 62 },
  { week: "W42", releases: 74 }, { week: "W43", releases: 88 }, { week: "W44", releases: 29 },
  { week: "W45", releases: 45 }, { week: "W46", releases: 37 }, { week: "W47", releases: 52 },
];

function Donut({ positive, size = 160 }: { positive: number; size?: number }) {
  const s = 14, r = (size - s) / 2, c = 2 * Math.PI * r, g = (positive / 100) * c, red = c - g, mid = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#292935" strokeWidth={s} />
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#3FB37C" strokeWidth={s} strokeDasharray={`${g} ${c}`} strokeDashoffset={c * 0.25} strokeLinecap="round" />
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#D9534F" strokeWidth={s} strokeDasharray={`${red} ${c}`} strokeDashoffset={-(g - c * 0.25)} strokeLinecap="round" />
      <text x={mid} y={mid + 2} textAnchor="middle" dominantBaseline="middle" className="fill-on-surface font-heading text-[36px] font-bold">{positive}%</text>
    </svg>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-[#D9D9DE]/90 border-t border-white/70">
      <span className="text-[11px] text-[#6E6E7C] font-mono uppercase tracking-wider">{label}</span>
      <span className="font-heading text-[28px] font-bold text-[#1E1E2A] leading-none">{value}</span>
    </div>
  );
}

export default function AnalyticsPhase({ onStartNewSession }: Props) {
  return (
    <div className="max-w-[1000px] mx-auto px-8 py-8 relative">
      <StepPills active="launch-window" />

      <h1 className="font-heading text-[32px] font-bold text-white tracking-tight mb-1">Analytics</h1>
      <p className="text-[15px] text-on-surface-variant mb-8">Predicted performance based on your comparables and market conditions.</p>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Metric label="Copies sold" value="~1.2k" />
        <Metric label="Average cost" value="~$7.99" />
        <Metric label="Projected revenue" value="~$9.6k" />
        <Metric label="Est. total revenue" value="~$1.2M" />
      </div>

      {/* 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Market saturation */}
        <div className="rounded-xl bg-[#D9D9DE]/90 border-t border-white/70 p-5 shadow-md">
          <h3 className="font-heading text-[16px] font-bold text-[#1E1E2A] mb-3">Market saturation</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={MARKET_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#B0B0B8" />
              <XAxis dataKey="week" tick={{ fill: "#6E6E7C", fontSize: 10 }} axisLine={{ stroke: "#6E6E7C" }} />
              <YAxis tick={{ fill: "#6E6E7C", fontSize: 10 }} axisLine={{ stroke: "#6E6E7C" }} />
              <Tooltip contentStyle={{ background: "#1E1E2A", border: "none", borderRadius: 8, color: "#E3E0F1", fontSize: 12 }} />
              <Line type="monotone" dataKey="releases" stroke="#1E1E2A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-[#6E6E7C] mt-2">Competing releases per week</p>
        </div>

        {/* Release window */}
        <div className="rounded-xl bg-[#D9D9DE]/90 border-t border-white/70 p-5 shadow-md flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[36px] text-[#4354B4]">calendar_today</span>
          <h3 className="font-heading text-[16px] font-bold text-[#1E1E2A]">Best release window</h3>
          <p className="font-heading text-[24px] font-bold text-[#1E1E2A] text-center">Oct 26 &ndash; Nov 1</p>
          <p className="text-[13px] text-[#6E6E7C]">Week 44 &middot; 2026</p>
          <div className="px-4 py-1.5 rounded-lg bg-[#3FB37C] text-white font-heading text-[13px] font-bold tracking-wider">KEEP</div>
        </div>

        {/* Reviews / sentiment */}
        <div className="rounded-xl bg-surface-container-lowest/60 border border-outline-variant/30 p-5 shadow-md flex flex-col items-center justify-center gap-3">
          <h3 className="font-heading text-[16px] font-bold text-on-surface">Predicted reviews</h3>
          <Donut positive={70} />
          <p className="font-heading text-[15px] font-semibold text-on-surface">Overall positive</p>
        </div>
      </div>

      {/* Success rate + exports */}
      <div className="flex items-end justify-between">
        <h2 className="font-heading text-[48px] font-bold text-white tracking-tighter leading-[1]">
          Success rate: <span className="text-[#E0D438]">67%</span>
        </h2>
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

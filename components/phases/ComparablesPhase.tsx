"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import StepPills from "@/components/phases/StepPills";
import { COMPARABLE_GAMES, type ComparableGame } from "@/lib/mock-data";

interface Props {
  onNext: () => void;
  onBack: () => void;
  onStartNewSession: () => void;
}

function Card({ c }: { c: ComparableGame }) {
  return (
    <div className="bg-[#D9D9DE]/90 rounded-2xl p-3 flex flex-col shadow-md hover:-translate-y-0.5 transition-transform">
      {/* Cover */}
      <div className="w-full h-[160px] rounded-xl flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: c.color }}>
        <span className="font-heading text-[28px] font-bold text-white/80">{c.initials}</span>
      </div>

      {/* Name + description */}
      <div className="pt-3 pb-1">
        <h3 className="font-heading text-[17px] font-bold text-[#1E1E2A] truncate">{c.name}</h3>
        <p className="text-[12px] text-[#6E6E7C] italic line-clamp-2 leading-snug mt-0.5">{c.description}</p>
      </div>

      {/* Metrics: revenue, copies, reviews, price */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 pt-2 border-t border-black/5 text-[#1E1E2A]">
        <div><span className="text-[10px] text-[#6E6E7C] uppercase font-mono">Est. Revenue</span><p className="font-heading text-[15px] font-bold">{c.estRevenue}</p></div>
        <div><span className="text-[10px] text-[#6E6E7C] uppercase font-mono">Est. Copies</span><p className="font-heading text-[15px] font-bold">{c.estCopies}</p></div>
        <div><span className="text-[10px] text-[#6E6E7C] uppercase font-mono">Reviews</span><p className="font-heading text-[15px] font-bold">{c.reviews}</p></div>
        <div><span className="text-[10px] text-[#6E6E7C] uppercase font-mono">Price</span><p className="font-heading text-[15px] font-bold">{c.price}</p></div>
      </div>

      {/* Sales history mini-chart */}
      <div className="mt-2 pt-2 border-t border-black/5">
        <span className="text-[10px] text-[#6E6E7C] uppercase font-mono">Sales trend</span>
        <div className="h-[50px] mt-1">
          <ResponsiveContainer width="100%" height={50}>
            <LineChart data={c.salesHistory}>
              <Tooltip
                contentStyle={{ background: "#1E1E2A", border: "none", borderRadius: 6, color: "#fff", fontSize: 11, padding: "4px 8px" }}
                formatter={(v: number) => [`${(v / 1000).toFixed(0)}K`, "Units"]}
                labelStyle={{ color: "#B8C4FF", fontSize: 10 }}
              />
              <Line type="monotone" dataKey="units" stroke="#4354B4" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-black/5">
        {c.tags.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded bg-black/5 text-[10px] text-[#6E6E7C] font-mono">{t}</span>
        ))}
      </div>

      {/* Footer: release date + Steam link */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
        <span className="text-[11px] text-[#6E6E7C]">{c.releaseDate}</span>
        <a href={c.steamUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#4354B4] hover:underline flex items-center gap-0.5">
          Steam <span className="material-symbols-outlined text-[12px]">open_in_new</span>
        </a>
      </div>
    </div>
  );
}

export default function ComparablesPhase({ onNext, onBack, onStartNewSession }: Props) {
  return (
    <div className="max-w-[900px] mx-auto px-8 py-8 relative">
      <StepPills active="comparables" />

      <h1 className="font-heading text-[32px] font-semibold text-white tracking-tight mb-1">Comparable games &mdash; {COMPARABLE_GAMES.length}</h1>
      <p className="text-[15px] text-on-surface-variant mb-6">Matched on gameplay description, not tags. Here&apos;s what each one actually did.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPARABLE_GAMES.map((c) => <Card key={c.initials} c={c} />)}
      </div>

      {/* Proceed */}
      <div className="flex justify-end mt-8">
        <button onClick={onNext} className="px-6 py-3 rounded-xl bg-primary-container hover:bg-inverse-primary text-white font-heading text-[16px] font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95">
          Run predictions <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
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

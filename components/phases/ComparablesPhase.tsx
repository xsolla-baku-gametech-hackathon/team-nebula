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
    <div className="relative rounded-xl overflow-hidden border border-outline-variant/20 hover:border-outline-variant/40 transition-colors group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={c.headerImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-container via-surface-container/90 to-surface-container/50" />

      <div className="relative p-4 flex flex-col gap-2.5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-heading text-[16px] font-semibold text-on-surface">{c.name}</h3>
            <p className="text-[12px] text-on-surface-variant truncate max-w-[280px]">{c.description}</p>
          </div>
          <a href={c.steamUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-0.5 shrink-0">
            Steam <span className="material-symbols-outlined text-[12px]">open_in_new</span>
          </a>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { l: "Revenue", v: c.estRevenue },
            { l: "Copies", v: c.estCopies },
            { l: "Reviews", v: c.reviews },
            { l: "Price", v: c.price },
          ].map((m) => (
            <div key={m.l}>
              <span className="text-[10px] text-on-surface-variant/60 uppercase font-mono">{m.l}</span>
              <p className="font-heading text-[15px] font-bold text-on-surface leading-tight">{m.v}</p>
            </div>
          ))}
        </div>

        <div className="flex items-end gap-3 pt-1 border-t border-outline-variant/10">
          <div className="w-[100px] h-[28px] shrink-0">
            <ResponsiveContainer width="100%" height={28}>
              <LineChart data={c.salesHistory}>
                <Tooltip contentStyle={{ background: "#1a1c26", border: "1px solid #363842", borderRadius: 6, color: "#e8e9ed", fontSize: 10, padding: "3px 6px" }} formatter={(v: number) => [`${(v / 1000).toFixed(0)}K`, ""]} />
                <Line type="monotone" dataKey="units" stroke="#6c8cff" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-1 flex-1">
            {c.tags.map((t) => (
              <span key={t} className="px-1.5 py-0.5 rounded text-[9px] text-on-surface-variant/60 border border-outline-variant/20 font-mono">{t}</span>
            ))}
          </div>
          <span className="text-[11px] text-on-surface-variant/50 shrink-0">{c.releaseDate}</span>
        </div>
      </div>
    </div>
  );
}

export default function ComparablesPhase({ onNext, onBack, onStartNewSession }: Props) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-5">
      <StepPills active="comparables" />

      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h1 className="font-heading text-[24px] font-semibold text-on-surface">Comparable games</h1>
          <p className="text-[13px] text-on-surface-variant">{COMPARABLE_GAMES.length} games matched on gameplay description</p>
        </div>
        <button onClick={onNext} className="h-10 px-5 rounded-xl bg-primary text-on-primary text-[14px] font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
          Run predictions <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {COMPARABLE_GAMES.map((c) => <Card key={c.initials} c={c} />)}
      </div>

      <div className="flex justify-center mt-8">
        <button onClick={onStartNewSession} className="text-on-surface-variant hover:text-on-surface text-[12px] transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">restart_alt</span> New session
        </button>
      </div>
    </div>
  );
}

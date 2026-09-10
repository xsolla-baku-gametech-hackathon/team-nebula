"use client";

import StepPills from "@/components/phases/StepPills";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

interface Comparable {
  initials: string;
  name: string;
  desc: string;
  cluster: string;
  icon: string;
  color: string;
  vector: string;
  tag: string;
  revenue: string;
  revSource: "estimate" | "fact";
  copies: string;
  copiesSource: "estimate" | "fact";
  reviews: string;
  price: string;
  launched: string;
}

const COMPARABLES: Comparable[] = [
  { initials: "SF", name: "Space Foodtruck", desc: "Co-op extraction horror, 4-player, procedural trials…", cluster: "CLUSTER A-1", icon: "satellite_alt", color: "#A86579", vector: "0.88", tag: "ASYMMETRIC", revenue: "$1.4M", revSource: "estimate", copies: "84K", copiesSource: "estimate", reviews: "2,140", price: "$19.99", launched: "Oct 2024" },
  { initials: "AE", name: "Abyssal Echoes", desc: "Deep sea sensor stealth, sub navigation stress…", cluster: "CLUSTER B-2", icon: "graphic_eq", color: "#6E2631", vector: "0.94", tag: "SONAR ROGUE", revenue: "$1.1M", revSource: "estimate", copies: "62K", copiesSource: "estimate", reviews: "1,620", price: "$17.99", launched: "Aug 2024" },
  { initials: "SP", name: "Submerged Panic", desc: "Resource attrition, pressure hulls, atmospheric leak…", cluster: "CLUSTER A-4", icon: "warning", color: "#5B6A47", vector: "0.82", tag: "TACTICAL SURVIVAL", revenue: "$890K", revSource: "estimate", copies: "46K", copiesSource: "estimate", reviews: "1,180", price: "$19.99", launched: "Jun 2024" },
  { initials: "VD", name: "Void Diver 4", desc: "Vacuum salvage extraction, tight loop oxygen decay…", cluster: "CLUSTER C-1", icon: "radio_button_checked", color: "#7E6379", vector: "0.91", tag: "EXPEDITION HORROR", revenue: "$2.2M", revSource: "estimate", copies: "112K", copiesSource: "estimate", reviews: "3,490", price: "$24.99", launched: "Nov 2024" },
  { initials: "DP", name: "Depth Protocol", desc: "Industrial pipeline diagnostics, anomaly containment…", cluster: "CLUSTER B-5", icon: "terminal", color: "#9B3B32", vector: "0.85", tag: "SYSTEM MONITOR", revenue: "$650K", revSource: "estimate", copies: "38K", copiesSource: "estimate", reviews: "880", price: "$14.99", launched: "May 2024" },
  { initials: "RS", name: "Rust & Salt", desc: "Brine salvage, rust hazard management, wreck raiding…", cluster: "CLUSTER A-2", icon: "waves", color: "#5C4A63", vector: "0.89", tag: "NAVAL CORROSION", revenue: "$1.3M", revSource: "estimate", copies: "75K", copiesSource: "estimate", reviews: "1,940", price: "$19.99", launched: "Sep 2024" },
];

function ProvenanceBadge({ type }: { type: "estimate" | "fact" }) {
  if (type === "fact") {
    return (
      <span className="inline-flex w-fit px-1.5 py-0.5 rounded-full bg-[#14141F] text-white font-mono text-[8px] font-medium leading-tight">
        FACT &middot; Steam
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit px-1.5 py-0.5 rounded-full border border-dashed border-[#555566] text-[#1E1E2A] font-mono text-[8px] font-medium leading-tight">
      ESTIMATE &middot; model
    </span>
  );
}

function CompCard({ c }: { c: Comparable }) {
  return (
    <div className="w-full bg-[#D9D9DE]/90 backdrop-blur-xl rounded-2xl p-3 flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-t border-white/60 transition-transform duration-200 hover:-translate-y-1">
      {/* Cover */}
      <div className="w-full h-[300px] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-inner" style={{ backgroundColor: c.color }}>
        <div className="flex justify-between items-start">
          <span className="font-mono text-[10px] text-white/60 tracking-widest uppercase font-semibold leading-[14px]">{c.cluster}</span>
          <span className="material-symbols-outlined text-white/50 text-[18px]">{c.icon}</span>
        </div>
        <div className="flex flex-col items-center justify-center my-auto">
          <div className="w-14 h-14 rounded-xl bg-black/15 flex items-center justify-center text-white/90 font-heading text-[28px] font-semibold leading-[36px]">
            {c.initials}
          </div>
        </div>
        <div className="flex justify-between items-center text-white/70 font-mono text-[9px] font-medium leading-[12px]">
          <span>VECTOR {c.vector}</span>
          <span>{c.tag}</span>
        </div>
      </div>

      {/* Meta */}
      <div className="pt-3 pb-1 flex flex-col gap-1">
        <h2 className="font-heading text-[20px] font-bold text-[#1E1E2A] leading-tight truncate">{c.name}</h2>
        <p className="text-[#6E6E7C] text-[13px] italic truncate">{c.desc}</p>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-black/5">
        <div className="flex flex-col gap-1">
          <span className="text-[#6E6E7C] font-mono text-[9px] uppercase tracking-wide font-medium leading-[12px]">Revenue</span>
          <span className="font-heading text-[17px] font-bold text-[#1E1E2A] leading-none">{c.revenue}</span>
          <ProvenanceBadge type={c.revSource} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[#6E6E7C] font-mono text-[9px] uppercase tracking-wide font-medium leading-[12px]">Copies</span>
          <span className="font-heading text-[17px] font-bold text-[#1E1E2A] leading-none">{c.copies}</span>
          <ProvenanceBadge type={c.copiesSource} />
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-[#6E6E7C] font-mono text-[9px] uppercase tracking-wide font-medium leading-[12px]">Reviews</span>
          <span className="font-heading text-[17px] font-bold text-[#1E1E2A] leading-none">{c.reviews}</span>
          <ProvenanceBadge type="fact" />
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <span className="text-[#6E6E7C] font-mono text-[9px] uppercase tracking-wide font-medium leading-[12px]">Price</span>
          <span className="font-heading text-[17px] font-bold text-[#1E1E2A] leading-none">{c.price}</span>
          <ProvenanceBadge type="fact" />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between">
        <span className="text-[#1E1E2A] text-[12px] font-medium">Launched: {c.launched}</span>
        <ProvenanceBadge type="fact" />
      </div>
    </div>
  );
}

export default function ComparablesPhase({ onNext, onBack }: Props) {
  return (
    <div className="max-w-[1440px] mx-auto px-12 py-8">
      <div className="flex flex-col w-full relative min-h-[1080px] pb-32 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-24 top-72 w-[620px] h-[620px] rounded-full bg-secondary-container/20 blur-[130px] -z-10" />
        <div className="pointer-events-none absolute -left-20 bottom-12 w-[540px] h-[540px] rounded-full bg-inverse-primary/15 blur-[140px] -z-10" />

        {/* Step pills */}
        <StepPills active="comparables" />

        {/* Content */}
        <div className="w-full max-w-[820px] mx-auto xl:ml-[160px] 2xl:ml-[220px] flex flex-col">
          {/* Header */}
          <div className="flex flex-col gap-2 mb-8">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-[40px] font-semibold text-white tracking-tight leading-[48px]">Comparable games &mdash; 6</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-mono text-[10px] font-medium border border-white/10 uppercase tracking-wider leading-[12px]">Semantic Sync</span>
            </div>
            <p className="text-[#A9A9B8] text-[16px] leading-[24px]">
              Matched on gameplay description, not tags. Here&apos;s what each one actually did.
            </p>
          </div>

          {/* 3x2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {COMPARABLES.map((c) => <CompCard key={c.initials} c={c} />)}
          </div>

          {/* Summary bar */}
          <div className="w-full mt-8 bg-[#D9D9DE]/90 backdrop-blur-xl rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between shadow-[0_8px_24px_rgba(0,0,0,0.35)] border-t border-white/60 gap-3">
            <div className="flex items-center gap-2 flex-wrap text-[#1E1E2A] font-heading text-[17px] font-medium">
              <span>Median of these 6:</span>
              <span className="font-bold">$1.2M revenue</span>
              <ProvenanceBadge type="estimate" />
              <span className="text-[#6E6E7C] px-1">&middot;</span>
              <span className="font-bold">1,850 reviews</span>
              <ProvenanceBadge type="fact" />
              <span className="text-[#6E6E7C] px-1">&middot;</span>
              <span className="font-bold">$19.99 launch price</span>
              <ProvenanceBadge type="fact" />
            </div>
          </div>
        </div>

        {/* Floating CTA */}
        <aside className="fixed bottom-8 right-8 z-50">
          <button
            onClick={onNext}
            className="w-[280px] h-[64px] bg-[#6B7FD7] hover:bg-[#7B8DE0] active:bg-[#5769C4] text-white font-heading text-[20px] font-semibold rounded-xl flex items-center justify-center gap-3 shadow-[0_12px_32px_rgba(107,127,215,0.45)] transition-all transform hover:-translate-y-0.5 group cursor-pointer"
          >
            <span>Score my launch weeks</span>
            <span className="material-symbols-outlined text-[24px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </button>
        </aside>
      </div>
    </div>
  );
}

"use client";

import StepPills from "@/components/phases/StepPills";

interface Props {
  onNext: () => void;
  onBack: () => void;
  onStartNewSession: () => void;
}

interface Comparable {
  initials: string;
  name: string;
  desc: string;
  color: string;
  revenue: string;
  copies: string;
  reviews: string;
  price: string;
  launched: string;
  tags: string[];
  steamUrl: string;
}

const COMPARABLES: Comparable[] = [
  { initials: "SF", name: "Space Foodtruck", desc: "Co-op extraction horror, 4-player, procedural trials", color: "#A86579", revenue: "$1.4M", copies: "84K", reviews: "2,140", price: "$19.99", launched: "Oct 2024", tags: ["Co-op", "Horror", "Roguelike"], steamUrl: "#" },
  { initials: "AE", name: "Abyssal Echoes", desc: "Deep sea sensor stealth, sub navigation stress", color: "#6E2631", revenue: "$1.1M", copies: "62K", reviews: "1,620", price: "$17.99", launched: "Aug 2024", tags: ["Horror", "Stealth", "Underwater"], steamUrl: "#" },
  { initials: "SP", name: "Submerged Panic", desc: "Resource attrition, pressure hulls, atmospheric leak", color: "#5B6A47", revenue: "$890K", copies: "46K", reviews: "1,180", price: "$19.99", launched: "Jun 2024", tags: ["Survival", "Horror", "Co-op"], steamUrl: "#" },
  { initials: "VD", name: "Void Diver 4", desc: "Vacuum salvage extraction, tight loop oxygen decay", color: "#7E6379", revenue: "$2.2M", copies: "112K", reviews: "3,490", price: "$24.99", launched: "Nov 2024", tags: ["Extraction", "Horror", "Sci-Fi"], steamUrl: "#" },
  { initials: "DP", name: "Depth Protocol", desc: "Industrial pipeline diagnostics, anomaly containment", color: "#9B3B32", revenue: "$650K", copies: "38K", reviews: "880", price: "$14.99", launched: "May 2024", tags: ["Atmospheric", "Indie", "Horror"], steamUrl: "#" },
  { initials: "RS", name: "Rust & Salt", desc: "Brine salvage, rust hazard management, wreck raiding", color: "#5C4A63", revenue: "$1.3M", copies: "75K", reviews: "1,940", price: "$19.99", launched: "Sep 2024", tags: ["Survival", "Multiplayer", "Naval"], steamUrl: "#" },
];

function Card({ c }: { c: Comparable }) {
  return (
    <div className="bg-[#D9D9DE]/90 rounded-2xl p-3 flex flex-col shadow-md hover:-translate-y-0.5 transition-transform">
      {/* Cover */}
      <div className="w-full h-[200px] rounded-xl flex items-center justify-center" style={{ backgroundColor: c.color }}>
        <span className="font-heading text-[28px] font-bold text-white/80">{c.initials}</span>
      </div>
      {/* Info */}
      <div className="pt-3 pb-1">
        <h3 className="font-heading text-[17px] font-bold text-[#1E1E2A] truncate">{c.name}</h3>
        <p className="text-[12px] text-[#6E6E7C] italic truncate">{c.desc}</p>
      </div>
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 pt-2 border-t border-black/5 text-[#1E1E2A]">
        <div><span className="text-[10px] text-[#6E6E7C] uppercase font-mono">Revenue</span><p className="font-heading text-[15px] font-bold">{c.revenue}</p></div>
        <div><span className="text-[10px] text-[#6E6E7C] uppercase font-mono">Copies</span><p className="font-heading text-[15px] font-bold">{c.copies}</p></div>
        <div><span className="text-[10px] text-[#6E6E7C] uppercase font-mono">Reviews</span><p className="font-heading text-[15px] font-bold">{c.reviews}</p></div>
        <div><span className="text-[10px] text-[#6E6E7C] uppercase font-mono">Price</span><p className="font-heading text-[15px] font-bold">{c.price}</p></div>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-black/5">
        {c.tags.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded bg-black/5 text-[10px] text-[#6E6E7C] font-mono">{t}</span>
        ))}
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
        <span className="text-[11px] text-[#6E6E7C]">Launched: {c.launched}</span>
        <a href={c.steamUrl} className="text-[11px] text-[#4354B4] hover:underline flex items-center gap-0.5">
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

      <h1 className="font-heading text-[32px] font-semibold text-white tracking-tight mb-1">Comparable games &mdash; 6</h1>
      <p className="text-[15px] text-on-surface-variant mb-6">Matched on gameplay description, not tags.</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPARABLES.map((c) => <Card key={c.initials} c={c} />)}
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-2xl bg-[#D9D9DE]/90 px-5 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[#1E1E2A] font-heading text-[15px] shadow-md">
        <span>Median:</span>
        <span className="font-bold">$1.2M revenue</span>
        <span className="text-[#6E6E7C]">&middot;</span>
        <span className="font-bold">1,850 reviews</span>
        <span className="text-[#6E6E7C]">&middot;</span>
        <span className="font-bold">$19.99 price</span>
      </div>

      {/* CTA */}
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

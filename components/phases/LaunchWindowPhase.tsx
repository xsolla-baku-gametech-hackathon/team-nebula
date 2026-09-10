"use client";

import { useState } from "react";
import StepPills from "@/components/phases/StepPills";

interface Props {
  onBack: () => void;
  onStartOver: () => void;
}

type Verdict = "KEEP" | "MOVE" | "MITIGATE";

interface GameCover {
  label: string;
  color: string;
  title: string;
}

interface WeekRow {
  weekNum: number;
  dateRange: string;
  subtitle: string;
  subtitleColor?: string;
  covers: GameCover[];
  overflow?: string;
  overlap: number;
  overlapColor?: string;
  verdict: Verdict;
  isUserWeek?: boolean;
  expanded?: {
    launching: { name: string }[];
    reasons: string[];
    mitigations: { icon: string; text: string }[];
  };
}

const VERDICT_COLORS: Record<Verdict, string> = {
  KEEP: "#3FB37C",
  MOVE: "#D9534F",
  MITIGATE: "#E0A438",
};

const WEEKS: WeekRow[] = [
  {
    weekNum: 41,
    dateRange: "Oct 5–11, 2026",
    subtitle: "2 tracked competitive releases",
    covers: [
      { label: "RUST", color: "#556B2F", title: "Project Rustbound" },
      { label: "VOID", color: "#8B2500", title: "Scrap Void" },
    ],
    overlap: 38,
    verdict: "KEEP",
  },
  {
    weekNum: 42,
    dateRange: "Oct 12–18, 2026",
    subtitle: "6 direct competitive launch collisions",
    isUserWeek: true,
    covers: [
      { label: "ABYSS", color: "#4A0E17", title: "Abyssal Drift" },
      { label: "SIREN", color: "#B06B78", title: "Deep Siren" },
      { label: "O2 DEBT", color: "#75526B", title: "Oxygen Debt" },
      { label: "SUB-9", color: "#536136", title: "Subsurface 9" },
    ],
    overflow: "+2 more",
    overlap: 74,
    verdict: "MITIGATE",
    expanded: {
      launching: [
        { name: "Abyssal Drift" },
        { name: "Deep Siren" },
        { name: "Oxygen Debt" },
      ],
      reasons: [
        "Co-op horror launch clustering saturates front page New & Trending queue.",
        "Direct price competitor at $19.99 with 85k overlapping wishlists.",
      ],
      mitigations: [
        { icon: "arrow_forward", text: "Shift 1 week later to Oct 26 to dodge genre press embargo day." },
        { icon: "percent", text: "Adjust launch discount to 15% to absorb price-conscious segment." },
        { icon: "sports_esports", text: "Ship Steam Next Fest demo in August to lock follower telemetry." },
      ],
    },
  },
  {
    weekNum: 43,
    dateRange: "Oct 19–25, 2026",
    subtitle: "Critical traffic collision · AAA Publisher window",
    subtitleColor: "#A82A27",
    covers: [
      { label: "DECAY", color: "#3B1F2B", title: "Chrono Decay" },
      { label: "HYDRO", color: "#1E3F4B", title: "Hydro Shock" },
      { label: "BOREAL", color: "#4C3B24", title: "Borealis Protocol" },
      { label: "HOLLOW", color: "#5A2A38", title: "Hollow Core" },
      { label: "BIO", color: "#223E2A", title: "Dead Biohazard" },
    ],
    overflow: "+1 more",
    overlap: 88,
    overlapColor: "#A82A27",
    verdict: "MOVE",
  },
  {
    weekNum: 44,
    dateRange: "Oct 26–Nov 1, 2026",
    subtitle: "Clear banner discovery runway · 1 competitor",
    subtitleColor: "#237852",
    covers: [
      { label: "ECHO", color: "#75526B", title: "Pale Echo" },
    ],
    overlap: 29,
    verdict: "KEEP",
  },
];

function CoverThumb({ cover }: { cover: GameCover }) {
  return (
    <div
      className="w-[44px] h-[60px] rounded-[6px] shadow-md flex flex-col justify-end p-1 relative overflow-hidden cursor-pointer"
      style={{ backgroundColor: cover.color }}
      title={cover.title}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <span className="relative z-10 font-mono text-[8px] text-white font-bold leading-none truncate">{cover.label}</span>
    </div>
  );
}

function WeekCard({ week }: { week: WeekRow }) {
  const [isExpanded, setIsExpanded] = useState(!!week.expanded);

  if (week.expanded && isExpanded) {
    return (
      <div className="w-full rounded-2xl bg-[#D9D9DE]/95 backdrop-blur-xl shadow-[0_16px_36px_-4px_rgba(0,0,0,0.45),0_0_0_2px_#6B7FD7] overflow-hidden">
        {/* Header */}
        <button onClick={() => setIsExpanded(false)} className="w-full px-6 py-5 flex items-center justify-between bg-white/30 border-b border-black/[0.06] text-left">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-[11px] font-semibold text-[#6E6E7C] uppercase tracking-wider leading-[14px]">WEEK {week.weekNum}</span>
              {week.isUserWeek && (
                <span className="bg-[#6B7FD7] text-white font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 leading-[12px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />Your week
                </span>
              )}
            </div>
            <span className="font-heading text-[20px] font-bold text-[#1E1E2A] leading-[28px] tracking-tight">{week.dateRange}</span>
            <span className="text-[#6E6E7C] text-[12px]">{week.subtitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {week.covers.map((c) => <CoverThumb key={c.label} cover={c} />)}
              {week.overflow && <span className="text-[#6E6E7C] font-heading text-[13px] font-semibold ml-1">{week.overflow}</span>}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-[#6E6E7C] font-mono text-[10px] uppercase tracking-wider font-medium leading-[12px]">Overlap</span>
                <span className="font-heading text-[26px] font-bold text-[#1E1E2A] leading-[36px]">{week.overlap}</span>
                <span className="text-[#6E6E7C] text-[12px] font-medium">/100</span>
              </div>
              <span className="bg-[#EBF0FF] text-[#4354B4] font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full leading-[12px]">PREDICTION &middot; engine</span>
            </div>
            <div className="w-[110px] h-[42px] rounded-[10px] text-white font-heading text-[15px] font-bold flex items-center justify-center tracking-wider shadow-sm" style={{ backgroundColor: VERDICT_COLORS[week.verdict] }}>
              {week.verdict}
            </div>
          </div>
        </button>

        {/* Expanded drawer */}
        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/40 text-[#1E1E2A]">
          {/* Who's launching */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#4354B4]">group</span>
              <h4 className="font-heading text-[14px] font-bold tracking-tight uppercase text-[#1E1E2A]">Who&apos;s launching</h4>
            </div>
            <div className="flex flex-col gap-2.5">
              {week.expanded.launching.map((g) => (
                <div key={g.name} className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/60">
                  <span className="text-[14px] font-semibold text-[#1E1E2A]">{g.name}</span>
                  <span className="bg-[#14141F] text-white font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full leading-[12px]">FACT &middot; Steam</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why this score */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#E0A438]">analytics</span>
              <h4 className="font-heading text-[14px] font-bold tracking-tight uppercase text-[#1E1E2A]">Why this score</h4>
            </div>
            <div className="flex flex-col gap-2">
              {week.expanded.reasons.map((r, i) => (
                <div key={i} className="flex flex-col gap-1 p-2 rounded-lg bg-white/60">
                  <p className="text-[12px] text-[#1E1E2A] leading-snug">{r}</p>
                  <div className="flex justify-end">
                    <span className="bg-[#EBF0FF] text-[#4354B4] font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-full">PREDICTION &middot; engine</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* If you MITIGATE */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#3FB37C]">verified</span>
              <h4 className="font-heading text-[14px] font-bold tracking-tight uppercase text-[#1E1E2A]">If you MITIGATE</h4>
            </div>
            <ul className="flex flex-col gap-2 text-[#1E1E2A] text-[12px]">
              {week.expanded.mitigations.map((m, i) => (
                <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/60">
                  <span className="material-symbols-outlined text-[16px] text-[#237852] mt-0.5">{m.icon}</span>
                  <span>{m.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => week.expanded && setIsExpanded(true)}
      className="w-full min-h-[110px] rounded-2xl bg-[#D9D9DE]/90 backdrop-blur-xl shadow-[0_8px_24px_-2px_rgba(0,0,0,0.35),0_2px_6px_-1px_rgba(0,0,0,0.20)] px-6 py-4 flex items-center justify-between transition-all hover:translate-y-[-1px] text-left"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-[#6E6E7C] uppercase tracking-wider leading-[14px]">
            WEEK {week.weekNum}{week.weekNum === 44 ? " · OPTIMAL WINDOW" : ""}
          </span>
          {week.isUserWeek && (
            <span className="bg-[#6B7FD7] text-white font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 leading-[12px]">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />Your week
            </span>
          )}
        </div>
        <span className="font-heading text-[20px] font-bold text-[#1E1E2A] leading-[28px] tracking-tight">{week.dateRange}</span>
        <span className="text-[12px] font-medium" style={{ color: week.subtitleColor ?? "#6E6E7C" }}>{week.subtitle}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {week.covers.map((c) => <CoverThumb key={c.label} cover={c} />)}
          {week.overflow && <span className="text-[#6E6E7C] font-heading text-[13px] font-semibold ml-1">{week.overflow}</span>}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-[#6E6E7C] font-mono text-[10px] uppercase tracking-wider font-medium leading-[12px]">Overlap</span>
            <span className="font-heading text-[26px] font-bold leading-[36px]" style={{ color: week.overlapColor ?? "#1E1E2A" }}>{week.overlap}</span>
            <span className="text-[#6E6E7C] text-[12px] font-medium">/100</span>
          </div>
          <span className="bg-[#EBF0FF] text-[#4354B4] font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full leading-[12px]">PREDICTION &middot; engine</span>
        </div>
        <div className="w-[110px] h-[42px] rounded-[10px] text-white font-heading text-[15px] font-bold flex items-center justify-center tracking-wider shadow-sm" style={{ backgroundColor: VERDICT_COLORS[week.verdict] }}>
          {week.verdict}
        </div>
      </div>
    </button>
  );
}

export default function LaunchWindowPhase({ onBack, onStartOver }: Props) {
  return (
    <div className="max-w-[1440px] mx-auto px-12 py-8">
      <div className="flex flex-col w-full relative min-h-[1420px] overflow-hidden text-on-surface select-none">
        {/* Ambient glow */}
        <div className="absolute -bottom-48 -left-52 w-[980px] h-[980px] rounded-full pointer-events-none z-0 mix-blend-screen opacity-90" style={{ background: "radial-gradient(circle at 45% 55%, #2E3FD8 0%, rgba(46, 63, 216, 0.75) 28%, rgba(143, 160, 240, 0.35) 55%, transparent 75%)", filter: "blur(48px)" }} />
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 bg-[radial-gradient(#8FA0F0_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Step pills */}
        <StepPills active="launch-window" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-[840px] mx-auto px-4 lg:px-0 flex flex-col">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-[40px] font-bold text-white tracking-tight leading-[48px]">Your candidate weeks</h1>
              <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-mono text-[10px] font-medium uppercase tracking-wider leading-[12px]">Algorithmic Match v4.2</span>
            </div>
            <p className="text-[#A9A9B8] text-[16px] leading-relaxed max-w-[780px]">
              Every week ahead of you, scored against who else is launching. 103 games release on Steam per day — this is the ~15 that matter to you.
            </p>
          </div>

          {/* Controls */}
          <div className="mt-6 mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 px-4 rounded-xl bg-[#D9D9DE]/90 backdrop-blur-md shadow-md flex items-center gap-2 cursor-pointer hover:bg-[#E4E6F0] transition-colors text-[#1E1E2A] font-heading text-[13px] font-medium">
                <span className="material-symbols-outlined text-[18px] text-[#4354B4]">calendar_today</span>
                <span>Planned week: <strong className="font-semibold">Oct 19–25, 2026</strong></span>
                <span className="material-symbols-outlined text-[16px] text-[#6E6E7C]">arrow_drop_down</span>
              </div>
              <span className="text-on-surface-variant font-mono text-[11px] font-semibold uppercase opacity-60 leading-[14px]">AUTO-CALIBRATED</span>
            </div>
            <div className="flex items-center bg-surface-container-lowest p-1 rounded-xl shadow-inner">
              <span className="font-mono text-[10px] font-medium text-on-surface-variant px-2.5 uppercase tracking-wide leading-[12px]">Show weeks:</span>
              <button className="px-3.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface text-[12px] font-semibold shadow-sm">Next 3 months</button>
              <button className="px-3.5 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface text-[12px] transition-colors">6 months</button>
            </div>
          </div>

          {/* Week rows */}
          <div className="flex flex-col gap-4 pb-32">
            {WEEKS.map((w) => <WeekCard key={w.weekNum} week={w} />)}
          </div>
        </div>

        {/* Floating CTA */}
        <aside className="fixed bottom-8 right-8 z-50">
          <button
            onClick={onStartOver}
            className="w-[210px] h-[64px] rounded-xl bg-[#6B7FD7] hover:bg-[#7B8DE0] active:bg-[#5769C4] text-white font-heading text-[20px] font-semibold tracking-tight shadow-[0_12px_28px_rgba(46,63,216,0.45)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Save to dashboard</span>
            <span className="material-symbols-outlined text-[24px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </aside>
      </div>
    </div>
  );
}

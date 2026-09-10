"use client";

import { useState } from "react";

interface Props {
  onStartScratch: () => void;
  onImport: () => void;
}

const STEPS = [
  { num: "01", title: "Describe your game", desc: "Plain text. No tags, no forms.", icon: "terminal" },
  { num: "02", title: "Find true comparables", desc: "Matched on how it plays, not on genre tags.", icon: "hub" },
  { num: "03", title: "See what they did", desc: "Revenue, copies, reviews, price, timing — each number labeled fact, estimate, or prediction.", icon: "query_stats" },
  { num: "04", title: "Score your launch week", desc: "Every candidate week ahead of you: KEEP, MOVE, or MITIGATE.", icon: "verified" },
];

function ImportModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-[620px] rounded-xl bg-[#F0F1F5] text-[#1E1E2A] p-8 shadow-[0_24px_48px_-6px_rgba(0,0,0,0.50)]">
        <div className="flex items-center justify-between pb-5 mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2E3FD8]">dataset</span>
            <h2 className="font-heading text-[20px] font-semibold text-[#1E1E2A] leading-[28px] tracking-tight">Target Steam Game URL</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[#6E6E7C]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <label className="font-mono text-[11px] font-semibold text-[#6E6E7C] uppercase tracking-wider leading-[14px]">
            Store URL or App ID
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#6E6E7C]">search</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-lg bg-white/90 text-[#1E1E2A] placeholder-[#8C8C9A] text-[14px] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#2E3FD8]"
              placeholder="https://store.steampowered.com/app/..."
            />
          </div>
          <div className="flex items-center gap-2 text-[#6E6E7C] font-mono text-[10px] font-medium leading-[12px]">
            <span className="material-symbols-outlined text-[14px]">info</span>
            Extracts public telemetry, current community tags, and semantic synopsis.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-5 py-3 rounded-lg text-[14px] font-medium text-[#1E1E2A] hover:bg-black/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!url.trim()) return;
              setLoading(true);
              setTimeout(() => { setLoading(false); onSubmit(url); }, 900);
            }}
            className="px-6 py-3 rounded-lg text-[14px] font-semibold bg-[#2E3FD8] text-white shadow-lg hover:bg-[#1E2FB8] transition-all flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-spin">&#9696;</span>
            ) : (
              <>
                <span>Run Diagnostic</span>
                <span className="material-symbols-outlined text-[18px]">bolt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePhase({ onStartScratch, onImport }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-[1440px] mx-auto px-12 py-8">
      <div className="flex flex-col w-full relative">
        {/* Ambient glow blob */}
        <div className="absolute -top-32 right-[-200px] w-[950px] h-[950px] pointer-events-none z-0 overflow-visible">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-secondary-container via-primary-container to-transparent blur-[110px] opacity-75 rotate-12 scale-110" />
        </div>

        <div className="relative z-10 w-full flex flex-col pt-6">
          <div className="flex flex-col lg:pl-[260px] max-w-[1360px] w-full">
            {/* Logo + status */}
            <div className="inline-flex items-center gap-3 mb-8">
              <img alt="ReleaseSignal Logo" className="h-10 w-auto object-contain brightness-110" src="/logo.svg" />
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[11px] font-semibold uppercase tracking-wider leading-[14px]">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                STEAM PROTOCOL 1.48 LINKED
              </div>
            </div>

            {/* Hero */}
            <div className="flex flex-col mt-10 mb-8">
              <div className="font-mono text-[10px] font-medium uppercase tracking-widest text-primary mb-3 flex items-center gap-2 leading-[12px]">
                <span className="inline-block w-8 h-[2px] bg-primary" />
                TEMPORAL ARBITRAGE &amp; COMPETITIVE GEOMETRY
              </div>
              <h1 className="font-heading text-[104px] lg:text-[120px] leading-[0.92] font-bold text-on-surface tracking-tighter select-none">
                Welcome<span className="text-primary">!</span>
              </h1>
            </div>

            {/* Subtitle */}
            <div className="max-w-[760px] mb-12">
              <p className="font-heading text-[20px] font-normal text-on-surface-variant leading-relaxed tracking-tight">
                Tags get you 300 roguelikes. Your description gets you the 15 that actually play like yours — and tells you who is launching against you next month.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col md:flex-row items-stretch gap-[26px] mb-16">
              <button
                onClick={() => setModalOpen(true)}
                className="group relative w-full md:w-[465px] h-[135px] rounded-xl bg-surface-container-lowest text-left p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:bg-surface-container-low hover:translate-y-[-2px] active:translate-y-[1px]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-heading text-[30px] leading-tight font-semibold text-on-surface group-hover:text-primary transition-colors">Import</span>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[28px]">north_east</span>
                </div>
                <div className="flex items-center gap-2 text-outline group-hover:text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-[18px]">link</span>
                  <span className="text-[14px]">Paste a Steam store page URL</span>
                </div>
              </button>

              <button
                onClick={onStartScratch}
                className="group relative w-full md:w-[465px] h-[135px] rounded-xl bg-primary-container text-left p-6 flex flex-col justify-between shadow-[0_16px_36px_rgba(46,63,216,0.32)] transition-all duration-300 hover:bg-tertiary-container hover:translate-y-[-2px] active:translate-y-[1px]"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-heading text-[30px] leading-tight font-bold text-on-primary group-hover:text-on-tertiary-container transition-colors">Start from scratch</span>
                  <div className="w-10 h-10 rounded-full bg-on-primary flex items-center justify-center transition-transform group-hover:translate-x-1">
                    <span className="material-symbols-outlined text-primary text-[22px]">arrow_forward</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-on-primary/80 group-hover:text-on-tertiary-container/90 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">edit_note</span>
                  <span className="text-[14px] font-medium">Draft mechanics, tags &amp; window hypothesis</span>
                </div>
              </button>
            </div>

            {/* Step cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[22px] max-w-[1020px] w-full pb-12">
              {STEPS.map((step) => (
                <div
                  key={step.num}
                  className="relative w-full h-[275px] rounded-xl bg-[#D9D9DE]/90 backdrop-blur-xl p-6 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-medium text-[#6E6E7C] uppercase tracking-wider leading-[12px]">
                        Step &middot; {step.num}
                      </span>
                      <span className="material-symbols-outlined text-[#6E6E7C] text-[18px]">{step.icon}</span>
                    </div>
                    <h3 className="font-heading text-[22px] leading-snug font-bold text-[#1E1E2A]">{step.title}</h3>
                  </div>
                  <p className="text-[16px] italic leading-normal text-[#6E6E7C]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ImportModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={(url) => { setModalOpen(false); onImport(); }} />
    </div>
  );
}

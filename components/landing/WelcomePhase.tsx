"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  FileUp,
  Gamepad2,
  Landmark,
  SearchCheck,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { InvestorPreview } from "@/components/landing/InvestorPreview";

interface Props {
  onStartScratch: () => void;
  onImport: (data: Record<string, unknown>) => void;
}

function ImportModal({
  open,
  onClose,
  onImport,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (data: Record<string, unknown>) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((nextFile: File) => {
    setFile(nextFile);
    setError("");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    try {
      if (file.name.endsWith(".json")) {
        onImport(JSON.parse(await file.text()) as Record<string, unknown>);
      } else {
        onImport({ _importType: "document", _fileName: file.name });
      }
    } catch {
      setError("This file could not be read. Check the format and try again.");
      setLoading(false);
    }
  }, [file, onImport]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-session-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[480px] rounded-2xl border border-outline-variant/50 bg-surface-container-high p-6 shadow-[0_28px_90px_rgba(0,0,0,0.5)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-secondary">Continue analysis</p>
            <h2 id="import-session-title" className="mt-1 font-heading text-[19px] font-semibold text-on-surface">Import a previous session</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close import dialog" className="flex size-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface">
            <X size={18} />
          </button>
        </div>

        <button
          type="button"
          className={`flex h-[144px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed transition-colors ${dragOver ? "border-primary bg-primary/8" : "border-outline-variant hover:border-on-surface-variant"}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            if (event.dataTransfer.files[0]) handleFile(event.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".json,.md,.txt,.pdf,.doc,.docx"
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.[0]) handleFile(event.target.files[0]);
            }}
          />
          <FileUp size={23} className="text-primary" />
          {file ? (
            <div className="text-center">
              <p className="text-[14px] font-medium text-on-surface">{file.name}</p>
              <p className="mt-1 font-mono text-[10px] text-on-surface-variant">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-[13px] text-on-surface">Drop a report or session here</p>
              <p className="mt-1 text-[11px] text-on-surface-variant">JSON, text, document, or PDF</p>
            </div>
          )}
        </button>

        {error ? <p className="mt-3 text-[12px] text-red">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-lg px-4 text-[13px] text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={!file || loading} className="h-10 rounded-lg bg-primary px-4 text-[13px] font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40">
            {loading ? "Reading file…" : "Import session"}
          </button>
        </div>
      </div>
    </div>
  );
}

const outcomes = [
  ["Commercial upside", "Comparable revenue range", "Frame opportunity without false precision."],
  ["Market evidence", "Reviewed Steam cohort", "See why every comparable belongs."],
  ["Category pressure", "Saturation and timing", "Map concentration and release collisions."],
  ["Decision", "Keep, move, or mitigate", "Leave with a clear next action."],
];

const audiences = [
  {
    icon: Gamepad2,
    label: "Studios",
    title: "Pressure-test positioning",
    body: "Compare price, demand, reception, and timing before product and marketing plans harden.",
    decision: "Differentiate or de-risk",
  },
  {
    icon: Building2,
    label: "Publishers",
    title: "Sequence the portfolio",
    body: "See launch collisions and category concentration before committing campaign support.",
    decision: "Keep, move, or mitigate",
  },
  {
    icon: Landmark,
    label: "Investors",
    title: "Standardize market diligence",
    body: "Bring comparable selection, commercial ranges, and confidence into one investment view.",
    decision: "Advance, revise, or decline",
  },
];

export default function WelcomePhase({ onStartScratch, onImport }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.dataset.visible = "true");
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.visible = "true";
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="overflow-hidden">
      <section className="landing-grid relative border-b border-outline-variant/20">
        <div className="landing-glow pointer-events-none absolute -right-48 -top-52 size-[760px]" />
        <div className="relative mx-auto grid min-h-[720px] max-w-[1280px] grid-cols-1 items-center gap-14 px-5 py-16 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div className="landing-intro max-w-[600px]">
            <p className="flex items-center gap-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
              <span className="h-px w-8 bg-primary" />
              Steam launch &amp; commercial intelligence
            </p>
            <h1 className="mt-6 font-heading text-[clamp(2.8rem,5.5vw,4.9rem)] font-semibold leading-[1.01] tracking-[-0.052em] text-on-surface">
              Know what a Steam game could earn—and when it should launch.
            </h1>
            <p className="mt-6 max-w-[570px] text-[16px] leading-[1.7] text-on-surface-variant md:text-[17px]">
              Turn one game concept into reviewed comparables, a revenue range, market pressure, and a launch recommendation for studios, publishers, and investors.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={onStartScratch} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[14px] font-semibold text-on-primary shadow-[0_0_28px_rgba(108,140,255,0.16)] transition-all hover:-translate-y-0.5 hover:bg-primary-container">
                Analyze a game
                <ArrowRight size={17} />
              </button>
              <button type="button" onClick={() => setModalOpen(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-high px-6 text-[14px] font-medium text-on-surface transition-colors hover:bg-surface-container-highest">
                <Upload size={17} />
                Import session
              </button>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 text-[11px] text-on-surface-variant">
              {["Reviewed comparables", "Visible provenance", "Range-based outputs"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5"><Check size={13} className="text-green" />{item}</span>
              ))}
            </div>
          </div>

          <InvestorPreview />
        </div>
      </section>

      <section id="outcomes" className="border-b border-outline-variant/20 bg-surface-container-lowest/70">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 divide-y divide-outline-variant/25 px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 md:px-8 lg:grid-cols-4">
          {outcomes.map(([label, title, body]) => (
            <article key={label} className="py-6 sm:px-6 sm:first:pl-0">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-secondary">{label}</p>
              <h2 className="mt-2 font-heading text-[15px] font-semibold text-on-surface">{title}</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="evidence" className="mx-auto max-w-[1280px] px-5 py-20 md:px-8 lg:py-24">
        <div data-reveal className="reveal-section grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">Evidence process</p>
            <h2 className="mt-4 max-w-[580px] font-heading text-[34px] font-semibold leading-[1.12] tracking-[-0.035em] text-on-surface md:text-[42px]">
              A defensible market view in three reviewable stages.
            </h2>
          </div>
          <p className="max-w-[560px] text-[15px] leading-[1.7] text-on-surface-variant lg:justify-self-end">
            You approve the comparable cohort before commercial analysis begins. Every conclusion remains connected to its evidence and confidence.
          </p>
        </div>

        <div data-reveal className="reveal-section process-track relative mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <span className="process-signal hidden lg:block" aria-hidden="true" />
          {[
            { n: "01", icon: SearchCheck, title: "Structure the concept", body: "Map gameplay, audience, price, and launch assumptions from plain language.", tags: ["Concept signals", "Editable"] },
            { n: "02", icon: ShieldCheck, title: "Review the cohort", body: "Inspect ten verified Steam comparables and approve the evidence set.", tags: ["Steam facts", "Human review"] },
            { n: "03", icon: BarChart3, title: "Build the decision", body: "Compare revenue, reception, saturation, and weekly launch risk.", tags: ["Market estimate", "Recommendation"] },
          ].map((step) => (
            <article key={step.n} className="relative rounded-2xl border border-outline-variant/35 bg-surface-container-low p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/8 text-primary"><step.icon size={19} /></span>
                <span className="font-mono text-[9px] font-semibold tracking-[0.12em] text-on-surface-variant">{step.n}</span>
              </div>
              <h3 className="mt-7 font-heading text-[18px] font-semibold text-on-surface">{step.title}</h3>
              <p className="mt-3 text-[13px] leading-[1.65] text-on-surface-variant">{step.body}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {step.tags.map((tag) => <span key={tag} className="rounded-md border border-outline-variant/60 px-2 py-1 font-mono text-[9px] text-on-surface-variant">{tag}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-outline-variant/20 bg-surface-container-lowest/70">
        <div className="mx-auto max-w-[1280px] px-5 py-20 md:px-8 lg:py-24">
          <div data-reveal className="reveal-section max-w-[760px]">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">Built for decisions</p>
            <h2 className="mt-4 font-heading text-[34px] font-semibold leading-[1.12] tracking-[-0.035em] text-on-surface md:text-[42px]">One evidence layer for product, portfolio, and capital.</h2>
          </div>
          <div data-reveal className="reveal-section mt-11 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {audiences.map((audience) => (
              <article key={audience.label} className="rounded-2xl border border-outline-variant/35 bg-surface-container/65 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30">
                <audience.icon size={21} className="text-primary" />
                <p className="mt-7 font-mono text-[9px] font-semibold uppercase tracking-[0.13em] text-on-surface-variant">{audience.label}</p>
                <h3 className="mt-2 font-heading text-[19px] font-semibold text-on-surface">{audience.title}</h3>
                <p className="mt-3 text-[13px] leading-[1.65] text-on-surface-variant">{audience.body}</p>
                <p className="mt-6 border-t border-outline-variant/35 pt-4 text-[11px] font-medium text-secondary">Decision: {audience.decision}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-8 lg:py-24">
        <div data-reveal className="reveal-section landing-cta relative overflow-hidden rounded-[20px] border border-primary/25 bg-surface-container-low px-6 py-14 text-center md:px-12 md:py-16">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">Build the investment view</p>
          <h2 className="mx-auto mt-4 max-w-[800px] font-heading text-[34px] font-semibold leading-[1.12] tracking-[-0.035em] text-on-surface md:text-[46px]">Make the launch decision with the evidence visible.</h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[14px] leading-[1.7] text-on-surface-variant">Start with a plain-language concept. Review the games that define the market before any recommendation is produced.</p>
          <button type="button" onClick={onStartScratch} className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[14px] font-semibold text-on-primary transition-all hover:-translate-y-0.5 hover:bg-primary-container">
            Analyze a game <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <footer className="border-t border-outline-variant/20 bg-surface-container-lowest/70 px-5 py-7 md:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-2 text-[11px] text-on-surface-variant sm:flex-row sm:items-center">
          <p>ReleaseSignal · Steam market intelligence</p>
          <p>For studios, publishers, investors, and launch teams.</p>
        </div>
      </footer>

      <ImportModal open={modalOpen} onClose={() => setModalOpen(false)} onImport={(data) => { setModalOpen(false); onImport(data); }} />
    </div>
  );
}

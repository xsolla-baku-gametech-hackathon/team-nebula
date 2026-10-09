"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  FileUp,
  Upload,
  X,
} from "lucide-react";

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
            {loading ? "Reading file..." : "Import session"}
          </button>
        </div>
      </div>
    </div>
  );
}

const genreTags = ["Co-op horror", "Survival", "Psychological", "1-4 Players"];

const metrics = [
  { value: "72", label: "Market Fit" },
  { value: "$280K", label: "Est Revenue base" },
  { value: "LOW", label: "Saturation" },
];

const bulletPoints = [
  "Real market data",
  "AI-powered competitor discovery",
  "Quantitative analysis not guesswork",
];

const dataProviders = ["Steam", "IGDB", "Gamalytic"];

export default function WelcomePhase({ onStartScratch, onImport }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-12 px-6 py-20 md:px-10 lg:grid-cols-2 lg:gap-16 lg:py-28">
          {/* LEFT column */}
          <div>
            <span className="inline-block rounded-full border border-[#363842] bg-[#1a1c26] px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.1em] text-[#9da0ab]">
              Team Nebula &middot; Game Market Intelligence
            </span>

            <h1 className="mt-8 font-heading text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.08] tracking-[-0.04em] text-[#e8e9ed]">
              Know your market{" "}
              <span className="italic text-[#34d399]">before</span>{" "}
              you build it.
            </h1>

            <p className="mt-6 max-w-[520px] text-[16px] leading-[1.75] text-[#9da0ab] md:text-[17px]">
              AI-powered market analysis for game developers. Validate your concept with real data before investing months of development.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {bulletPoints.map((point) => (
                <li key={point} className="flex items-center gap-3 text-[14px] text-[#e8e9ed]">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#34d399]/15">
                    <Check size={12} className="text-[#34d399]" />
                  </span>
                  <span className="font-sans">{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#363842] bg-transparent px-6 font-sans text-[14px] font-medium text-[#e8e9ed] transition-all hover:border-[#9da0ab] hover:bg-[#1a1c26]"
              >
                Try a Sample Concept
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={onStartScratch}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#6c8cff] px-6 font-sans text-[14px] font-semibold text-white shadow-[0_0_32px_rgba(108,140,255,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#5a7bf0]"
              >
                Start Your Own
              </button>
            </div>

            <p className="mt-5 font-sans text-[12px] text-[#9da0ab]/70">
              No account required &middot; Free to use during the hackathon
            </p>
          </div>

          {/* RIGHT column - Preview Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[480px] rounded-2xl border border-[#363842] bg-[#1a1c26] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
              {/* Sample game quote */}
              <div className="rounded-xl border border-[#363842]/60 bg-[#0f1117] p-5">
                <p className="font-sans text-[13px] italic leading-[1.7] text-[#9da0ab]">
                  &ldquo;A cooperative horror survival game where 1-4 players explore a procedurally generated research facility, managing sanity and resources while uncovering psychological terrors.&rdquo;
                </p>
              </div>

              {/* Genre tags */}
              <div className="mt-5 flex flex-wrap gap-2">
                {genreTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-[#363842] bg-[#0f1117] px-3 py-1.5 font-sans text-[11px] font-medium text-[#9da0ab]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Market Analysis Complete badge */}
              <div className="mt-5 flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-[#34d399]/15">
                  <Check size={12} className="text-[#34d399]" />
                </span>
                <span className="font-sans text-[13px] font-semibold text-[#34d399]">
                  Market Analysis Complete
                </span>
              </div>

              {/* Metrics row */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-[#363842] bg-[#0f1117] px-4 py-4 text-center"
                  >
                    <p className="font-heading text-[22px] font-bold text-[#e8e9ed]">
                      {metric.value}
                    </p>
                    <p className="mt-1 font-sans text-[10px] font-medium uppercase tracking-[0.06em] text-[#9da0ab]">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Data Providers bar */}
      <section className="border-t border-[#363842]/40">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:justify-center sm:gap-10 md:px-10">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9da0ab]/60">
            Trusted Data Providers
          </span>
          <div className="flex items-center gap-8">
            {dataProviders.map((provider) => (
              <span
                key={provider}
                className="font-heading text-[15px] font-semibold text-[#9da0ab]/50 transition-colors hover:text-[#9da0ab]"
              >
                {provider}
              </span>
            ))}
            <span className="font-sans text-[13px] text-[#9da0ab]/40">
              &amp; more
            </span>
          </div>
        </div>
      </section>

      <ImportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onImport={(data) => {
          setModalOpen(false);
          onImport(data);
        }}
      />
    </div>
  );
}

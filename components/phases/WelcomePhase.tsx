"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  onStartScratch: () => void;
  onImport: (data: Record<string, unknown>) => void;
}

const STEPS = [
  { num: "01", title: "Describe your game", desc: "Plain text — no tags, no forms." },
  { num: "02", title: "Find true comparables", desc: "Matched on gameplay, not genre tags." },
  { num: "03", title: "See what they did", desc: "Revenue, copies, reviews, price, timing." },
  { num: "04", title: "Get your verdict", desc: "Predicted performance and launch window." },
];

function ImportModal({ open, onClose, onImport }: { open: boolean; onClose: () => void; onImport: (data: Record<string, unknown>) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => { setFile(f); setError(""); }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      if (file.name.endsWith(".json")) {
        const data = JSON.parse(await file.text()) as Record<string, unknown>;
        onImport(data);
      } else {
        onImport({ _importType: "document", _fileName: file.name });
      }
    } catch {
      setError("Failed to parse file.");
      setLoading(false);
    }
  }, [file, onImport]);

  if (!open) return null;
  const isJson = file?.name.endsWith(".json");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[540px] rounded-xl bg-[#F0F1F5] text-[#1E1E2A] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-[20px] font-semibold">Import session</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#6E6E7C]">close</span>
          </button>
        </div>

        <div
          className={`flex flex-col items-center justify-center gap-3 w-full h-[160px] rounded-xl border-2 border-dashed cursor-pointer transition-colors ${dragOver ? "border-[#2E3FD8] bg-[#2E3FD8]/5" : "border-[#B0B0B8] hover:border-[#6E6E7C]"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".json,.md,.txt,.pdf,.doc,.docx" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          {file ? (
            <div className="text-center">
              <span className="material-symbols-outlined text-[32px] text-[#2E3FD8]">{isJson ? "data_object" : "description"}</span>
              <p className="font-heading text-[15px] font-semibold mt-1">{file.name}</p>
              <p className="text-[12px] text-[#6E6E7C]">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="text-center">
              <span className="material-symbols-outlined text-[32px] text-[#8C8C9A]">cloud_upload</span>
              <p className="text-[14px] text-[#6E6E7C] mt-1">Drop a file or <span className="text-[#2E3FD8] font-medium">browse</span></p>
              <p className="text-[11px] text-[#8C8C9A] mt-1">JSON, Markdown, PDF, DOC</p>
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-red-600 text-[13px]">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-[14px] font-medium hover:bg-black/5">Cancel</button>
          <button onClick={handleSubmit} disabled={!file || loading} className="px-6 py-2.5 rounded-lg text-[14px] font-semibold bg-[#2E3FD8] text-white hover:bg-[#1E2FB8] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
            {loading ? <span className="animate-spin">&#9696;</span> : <span>{isJson ? "Import" : "Analyze"}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePhase({ onStartScratch, onImport }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-[1000px] mx-auto px-8 py-16 relative">
      {/* Hero */}
      <h1 className="font-heading text-[72px] lg:text-[88px] leading-[0.95] font-bold text-on-surface tracking-tighter">
        Welcome<span className="text-primary">!</span>
      </h1>
      <p className="mt-6 max-w-[640px] text-[18px] text-on-surface-variant leading-relaxed">
        Tags get you 300 roguelikes. Your description gets you the 15 that actually play like yours — and tells you who is launching against you next month.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 mt-10">
        <button
          onClick={() => setModalOpen(true)}
          className="group w-full sm:w-[280px] h-[100px] rounded-xl bg-surface-container-lowest text-left px-6 flex flex-col justify-center gap-1 shadow-lg hover:bg-surface-container-low transition-all hover:-translate-y-0.5"
        >
          <span className="font-heading text-[22px] font-semibold text-on-surface group-hover:text-primary transition-colors">Import</span>
          <span className="text-[13px] text-outline">Upload a JSON or document</span>
        </button>
        <button
          onClick={onStartScratch}
          className="group w-full sm:w-[280px] h-[100px] rounded-xl bg-primary-container text-left px-6 flex flex-col justify-center gap-1 shadow-[0_12px_28px_rgba(46,63,216,0.3)] hover:bg-tertiary-container transition-all hover:-translate-y-0.5"
        >
          <span className="font-heading text-[22px] font-bold text-on-primary group-hover:text-on-tertiary-container transition-colors">Start from scratch</span>
          <span className="text-[13px] text-on-primary/70">Describe your game concept</span>
        </button>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
        {STEPS.map((s) => (
          <div key={s.num} className="rounded-xl bg-[#D9D9DE]/90 p-5 flex flex-col justify-between h-[180px] shadow-md">
            <span className="font-mono text-[10px] text-[#6E6E7C] uppercase tracking-wider">Step {s.num}</span>
            <div>
              <h3 className="font-heading text-[17px] font-bold text-[#1E1E2A] leading-snug">{s.title}</h3>
              <p className="text-[13px] text-[#6E6E7C] mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <ImportModal open={modalOpen} onClose={() => setModalOpen(false)} onImport={(data) => { setModalOpen(false); onImport(data); }} />
    </div>
  );
}

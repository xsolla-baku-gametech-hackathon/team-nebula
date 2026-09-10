"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  onStartScratch: () => void;
  onImport: (data: Record<string, unknown>) => void;
}

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
    try {
      if (file.name.endsWith(".json")) {
        onImport(JSON.parse(await file.text()) as Record<string, unknown>);
      } else {
        onImport({ _importType: "document", _fileName: file.name });
      }
    } catch {
      setError("Failed to parse file.");
      setLoading(false);
    }
  }, [file, onImport]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[480px] rounded-2xl bg-surface-container-high p-6 border border-outline-variant/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-[18px] font-semibold text-on-surface">Import session</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <div
          className={`flex flex-col items-center justify-center gap-2 h-[120px] rounded-xl border border-dashed cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-outline-variant hover:border-on-surface-variant"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".json,.md,.txt,.pdf,.doc,.docx" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          {file ? (
            <div className="text-center">
              <p className="text-[14px] font-medium text-on-surface">{file.name}</p>
              <p className="text-[12px] text-on-surface-variant">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="text-center">
              <span className="material-symbols-outlined text-[24px] text-on-surface-variant">upload_file</span>
              <p className="text-[13px] text-on-surface-variant mt-1">Drop file or <span className="text-primary">browse</span></p>
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-red text-[12px]">{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] text-on-surface-variant hover:text-on-surface">Cancel</button>
          <button onClick={handleSubmit} disabled={!file || loading} className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-40">
            {loading ? "..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePhase({ onStartScratch, onImport }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px)] px-6">
      <div className="max-w-[600px] text-center">
        <h1 className="font-heading text-[48px] font-bold text-on-surface leading-tight tracking-tight">
          Launch timing<br />intelligence
        </h1>
        <p className="mt-4 text-[16px] text-on-surface-variant leading-relaxed">
          Describe your game. We find the comparables, show you what they did, and tell you when to launch.
        </p>

        <div className="flex gap-3 justify-center mt-8">
          <button
            onClick={() => setModalOpen(true)}
            className="h-11 px-6 rounded-xl border border-outline-variant text-on-surface text-[14px] font-medium hover:bg-surface-container-high transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            Import
          </button>
          <button
            onClick={onStartScratch}
            className="h-11 px-6 rounded-xl bg-primary text-on-primary text-[14px] font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            Start from scratch
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-16 text-left">
          {[
            { n: "1", t: "Describe", d: "Plain text, no forms" },
            { n: "2", t: "Compare", d: "Real Steam data" },
            { n: "3", t: "Analyze", d: "Revenue, reviews, timing" },
            { n: "4", t: "Decide", d: "Keep, move, or mitigate" },
          ].map((s) => (
            <div key={s.n} className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container/50">
              <span className="text-[11px] text-on-surface-variant font-mono">{s.n}</span>
              <p className="font-heading text-[14px] font-semibold text-on-surface mt-1">{s.t}</p>
              <p className="text-[12px] text-on-surface-variant mt-0.5">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <ImportModal open={modalOpen} onClose={() => setModalOpen(false)} onImport={(d) => { setModalOpen(false); onImport(d); }} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Braces, FileDown } from "lucide-react";
import type { Snapshot } from "@/lib/domain/types";

export function ExportBar({ snapshot }: { snapshot: Snapshot }) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportJson = async () => {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch("/api/export/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "JSON export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `releasesignal-${snapshot.snapshotId}.json`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "JSON export failed");
    } finally {
      setExporting(false);
    }
  };

  const exportPdf = () => {
    window.print();
  };

  return (
    <div className="print:hidden">
      <div className="flex gap-2">
      <button
        type="button"
        onClick={exportPdf}
        className="h-9 px-4 rounded-lg border border-outline-variant/30 text-on-surface text-[13px] font-medium hover:bg-surface-container transition-colors flex items-center gap-1.5"
      >
        <FileDown size={15} aria-hidden="true" /> PDF
      </button>
      <button
        type="button"
        onClick={exportJson}
        disabled={exporting}
        className="h-9 px-4 rounded-lg border border-outline-variant/30 text-on-surface text-[13px] font-medium hover:bg-surface-container transition-colors flex items-center gap-1.5 disabled:opacity-40"
      >
        <Braces size={15} aria-hidden="true" />
        {exporting ? "Exporting..." : "JSON"}
      </button>
      </div>
      {error ? <p role="alert" className="text-[11px] text-red mt-1.5 text-right">{error}</p> : null}
    </div>
  );
}

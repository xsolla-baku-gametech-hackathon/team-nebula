"use client";

import type { Snapshot } from "@/lib/types";

export function ExportBar({ snapshot }: { snapshot: Snapshot }) {
  const exportJson = async () => {
    const res = await fetch("/api/export/json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `releasesignal-${snapshot.snapshotId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    window.print();
  };

  return (
    <div className="flex gap-3 justify-center pt-4">
      <button
        onClick={exportPdf}
        className="px-5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
      >
        Export PDF
      </button>
      <button
        onClick={exportJson}
        className="px-5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
      >
        Export JSON
      </button>
    </div>
  );
}

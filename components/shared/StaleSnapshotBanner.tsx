"use client";

export function StaleSnapshotBanner({ onReanalyze }: { onReanalyze: () => void }) {
  return (
    <div className="rounded-lg border border-blue-300 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200 flex justify-between items-center">
      <span>Concept changed since last analysis. Results may be stale.</span>
      <button onClick={onReanalyze} className="underline font-medium">
        Re-analyze
      </button>
    </div>
  );
}

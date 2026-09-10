"use client";

import type { ReleaseWindow } from "@/lib/types";

export function WeekDetail({ window: releaseWindow }: { window: ReleaseWindow }) {
  return (
    <div className="border-t border-outline-variant/20 bg-surface-container-low px-4 py-3 text-[12px] space-y-2">
      <p className="font-medium text-on-surface">{releaseWindow.weekStart} to {releaseWindow.weekEnd}</p>
      {releaseWindow.competingReleases.length === 0 ? (
        <p className="text-on-surface-variant">No close competitors in this window.</p>
      ) : (
        <div className="space-y-2">
          {releaseWindow.competingReleases.map((release) => (
            <div key={release.igdbId} className="flex flex-wrap justify-between gap-x-4 gap-y-1">
              <span className="font-medium text-on-surface">{release.name}</span>
              <span className="text-on-surface-variant font-mono text-[10px]">
                {release.dateLabel} · {release.dateConfidence} · {release.similarity}% similar
                {release.hypes !== null ? ` · ${release.hypes} hypes` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
      {releaseWindow.drivers.length ? (
        <ul className="pt-1 space-y-1 text-[10px] text-on-surface-variant">
          {releaseWindow.drivers.map((driver) => <li key={`${driver.label}-${driver.detail}`}>{driver.detail}</li>)}
        </ul>
      ) : null}
    </div>
  );
}

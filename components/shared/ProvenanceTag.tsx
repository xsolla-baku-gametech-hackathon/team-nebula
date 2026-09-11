"use client";

import type { Sourced } from "@/lib/domain/types";

export function ProvenanceTag<T>({ sourced }: { sourced: Sourced<T> }) {
  const color = {
    steam: "text-blue-500",
    igdb: "text-purple-500",
    gamalytic: "text-green-500",
    releasesignal: "text-amber-500",
    user: "text-zinc-400",
  }[sourced.source];

  return (
    <span
      className={`inline-flex items-center text-xs ${color} cursor-help`}
      title={`Source: ${sourced.source}${sourced.estimated ? " (estimated)" : ""}${sourced.method ? ` · ${sourced.method}` : ""}`}
    >
      i
    </span>
  );
}

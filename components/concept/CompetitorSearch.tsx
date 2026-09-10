"use client";

import { useState, useEffect } from "react";

interface SearchResult {
  steamAppId: number;
  name: string;
  releaseDate: string | null;
  reviewCount: number | null;
  headerImage: string;
}

export function CompetitorSearch({ onAdd }: { onAdd: (appId: number) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) return;
    const controller = new AbortController();
    const debounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&limit=8`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.data?.results ?? []);
        setOpen(true);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      }
    }, 200);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  const visibleResults = query.length >= 2 ? results : [];

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => visibleResults.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Search for a game you consider a competitor..."
        className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {open && visibleResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg max-h-64 overflow-y-auto">
          {visibleResults.map((r) => (
            <button
              key={r.steamAppId}
              onClick={() => {
                onAdd(r.steamAppId);
                setQuery("");
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 flex justify-between"
            >
              <span className="font-medium">{r.name}</span>
              <span className="text-zinc-400 text-xs">
                {r.releaseDate ?? "—"} · {r.reviewCount?.toLocaleString() ?? "?"} reviews
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

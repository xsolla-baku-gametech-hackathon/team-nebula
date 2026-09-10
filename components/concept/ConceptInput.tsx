"use client";

import { useState } from "react";

export function ConceptInput({
  initialText,
  loading,
  onAnalyze,
}: {
  initialText?: string;
  loading: boolean;
  onAnalyze: (text: string) => void;
}) {
  const [text, setText] = useState(initialText ?? "");

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Describe your game</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="A co-op horror game where 4 players explore an abandoned Soviet research facility. Proximity voice chat. Runs are 30-40 min. PC first, around $14.99."
        className="w-full h-40 p-4 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex justify-end">
        <button
          onClick={() => onAnalyze(text)}
          disabled={text.trim().length < 20 || loading}
          className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing..." : "Analyze concept"}
        </button>
      </div>
    </div>
  );
}

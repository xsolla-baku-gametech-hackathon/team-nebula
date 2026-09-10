"use client";

import { useState } from "react";

type Phase = "landing" | "concept" | "comparables" | "forecast";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [description, setDescription] = useState("");

  if (phase === "landing") {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-4">
        <main className="max-w-2xl w-full text-center space-y-8 py-24">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">ReleaseSignal</h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400">
              Launch-timing intelligence for Steam developers.
            </p>
          </div>

          <div className="space-y-1 text-zinc-600 dark:text-zinc-300">
            <p className="text-3xl font-semibold text-foreground">720</p>
            <p>games launched on Steam last week.</p>
            <p className="text-sm text-zinc-400">530 of them finished with under ten reviews.</p>
          </div>

          <p className="text-xl font-medium">
            Find out who you&apos;re actually launching against.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setPhase("concept")}
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Start from scratch
            </button>
            <button
              disabled
              className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium text-zinc-400 cursor-not-allowed"
            >
              Import a document
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (phase === "concept") {
    return (
      <div className="flex flex-col flex-1 items-center px-4 py-12">
        <main className="max-w-2xl w-full space-y-6">
          <h2 className="text-2xl font-bold">Describe your game</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A co-op horror game where 4 players explore an abandoned Soviet research facility. Proximity voice chat. Runs are 30-40 min. PC first, around $14.99."
            className="w-full h-40 p-4 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-between items-center">
            <button
              onClick={() => setPhase("landing")}
              className="text-sm text-zinc-500 hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setPhase("comparables")}
              disabled={description.trim().length < 20}
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Find my competitors
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (phase === "comparables") {
    return (
      <div className="flex flex-col flex-1 items-center px-4 py-12">
        <main className="max-w-4xl w-full space-y-6">
          <h2 className="text-2xl font-bold">Comparables</h2>
          <p className="text-zinc-500">
            Competitor discovery will appear here once the corpus and AI layers are connected.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setPhase("concept")}
              className="text-sm text-zinc-500 hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={() => setPhase("forecast")}
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Run market analysis
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center px-4 py-12">
      <main className="max-w-4xl w-full space-y-6">
        <h2 className="text-2xl font-bold">Forecast</h2>
        <p className="text-zinc-500">
          Market analysis, revenue estimates, and the release calendar will appear here.
        </p>
        <button
          onClick={() => setPhase("landing")}
          className="text-sm text-zinc-500 hover:text-foreground"
        >
          Start new session
        </button>
      </main>
    </div>
  );
}

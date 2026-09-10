"use client";

export function Hero({ onStart, onImport }: { onStart: () => void; onImport: () => void }) {
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
          <p className="text-sm text-zinc-400">
            530 of them finished with under ten reviews.
          </p>
        </div>

        <p className="text-xl font-medium">
          Find out who you&apos;re actually launching against.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onStart}
            className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Start from scratch
          </button>
          <button
            onClick={onImport}
            className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Import a document
          </button>
        </div>
      </main>
    </div>
  );
}

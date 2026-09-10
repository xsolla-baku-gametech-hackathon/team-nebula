"use client";

export function ResumeCard({
  title,
  timestamp,
  onResume,
}: {
  title: string;
  timestamp: string;
  onResume: () => void;
}) {
  return (
    <button
      onClick={onResume}
      className="w-full max-w-md mx-auto rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
    >
      <p className="text-sm text-zinc-500">Resume your last session</p>
      <p className="font-medium">{title || "Untitled concept"}</p>
      <p className="text-xs text-zinc-400 mt-1">{timestamp}</p>
    </button>
  );
}

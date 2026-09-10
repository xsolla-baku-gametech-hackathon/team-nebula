"use client";

import { cn } from "@/lib/utils";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-zinc-200 dark:bg-zinc-800", className)} />
  );
}

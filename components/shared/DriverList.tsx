"use client";

import type { Driver } from "@/lib/domain/types";

export function DriverList({ drivers }: { drivers: Driver[] }) {
  return (
    <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
      {drivers.map((d, i) => (
        <li key={i} className="flex justify-between">
          <span>{d.label}</span>
          <span className="font-mono text-xs">
            {d.contribution > 0 ? "+" : ""}
            {d.contribution}
          </span>
        </li>
      ))}
    </ul>
  );
}

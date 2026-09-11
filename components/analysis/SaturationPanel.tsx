"use client";

import type { MarketReport } from "@/lib/domain/types";
import { ScoreBar } from "@/components/shared/ScoreBar";
import { DriverList } from "@/components/shared/DriverList";

export function SaturationPanel({ saturation }: { saturation: MarketReport["saturation"] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Market Saturation</h3>
      <ScoreBar score={saturation.score} band={saturation.band} label="Saturation" />
      <DriverList drivers={saturation.drivers} />
    </div>
  );
}

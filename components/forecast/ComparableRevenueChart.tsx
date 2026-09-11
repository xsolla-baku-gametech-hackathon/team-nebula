"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ScoredCompetitor } from "@/lib/types";

interface Props {
  competitors: ScoredCompetitor[];
}

function compactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function shortName(value: string): string {
  return value.length > 18 ? `${value.slice(0, 17)}…` : value;
}

export function ComparableRevenueChart({ competitors }: Props) {
  const data = competitors
    .flatMap((competitor) => {
      const revenue = competitor.game.commercial.estimatedRevenueUsd.value;
      if (revenue === null || revenue < 0) return [];
      return [{
        name: shortName(competitor.game.identity.name),
        fullName: competitor.game.identity.name,
        revenue,
        similarity: Math.round(competitor.similarity.score * 100),
      }];
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 7);

  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-outline-variant/30 px-8 text-center text-sm text-on-surface-variant">
        Comparable revenue evidence is unavailable. The forecast remains unpriced until verified commercial data is present.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full" aria-label="Estimated revenue among comparable games">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, bottom: 0, left: 8 }}>
          <CartesianGrid stroke="#2d303b" strokeDasharray="3 5" horizontal={false} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8f929e", fontSize: 10 }}
            tickFormatter={compactCurrency}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={116}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#c5c7ce", fontSize: 11 }}
          />
          <Tooltip
            formatter={(value) => [compactCurrency(Number(value)), "Est. revenue"]}
            labelFormatter={(_, payload) => {
              const item = payload?.[0]?.payload as { fullName?: string; similarity?: number } | undefined;
              return item ? `${item.fullName} · ${item.similarity}% match` : "Comparable";
            }}
            cursor={{ fill: "rgba(141, 162, 255, 0.06)" }}
            contentStyle={{
              background: "#171923",
              border: "1px solid #343743",
              borderRadius: 10,
              color: "#f0f1f5",
              fontSize: 12,
              boxShadow: "0 16px 40px rgba(0,0,0,.35)",
            }}
          />
          <Bar dataKey="revenue" fill="#758cff" radius={[0, 5, 5, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

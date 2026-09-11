"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReleaseWindow } from "@/lib/domain/types";

interface Props {
  windows: ReleaseWindow[];
  currentDate: string | null;
  recommendedDate: string | null;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function dateLabel(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function LaunchRiskChart({ windows, currentDate, recommendedDate }: Props) {
  if (!windows.length) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-outline-variant/30 text-sm text-on-surface-variant">
        Launch-pressure evidence is unavailable for this timeframe.
      </div>
    );
  }

  const data = windows.map((window) => ({
    date: window.weekStart,
    label: dateLabel(window.weekStart),
    risk: Math.round(window.risk),
    competingReleases: window.competingReleases.length,
  }));
  const currentLabel = currentDate ? dateLabel(currentDate) : null;
  const recommendedLabel = recommendedDate ? dateLabel(recommendedDate) : null;

  return (
    <div className="h-[280px] w-full" aria-label="Weekly launch collision risk">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 18, right: 12, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="launchRiskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8da2ff" stopOpacity={0.36} />
              <stop offset="100%" stopColor="#8da2ff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2d303b" strokeDasharray="3 5" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8f929e", fontSize: 11 }}
            minTickGap={32}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8f929e", fontSize: 11 }}
          />
          <Tooltip
            formatter={(value) => [`${Number(value)}/100`, "Collision risk"]}
            labelFormatter={(label) => `Week of ${String(label)}`}
            contentStyle={{
              background: "#171923",
              border: "1px solid #343743",
              borderRadius: 10,
              color: "#f0f1f5",
              fontSize: 12,
              boxShadow: "0 16px 40px rgba(0,0,0,.35)",
            }}
          />
          {currentLabel ? (
            <ReferenceLine
              x={currentLabel}
              stroke="#fbbf24"
              strokeDasharray="4 4"
              label={{ value: "Planned", fill: "#fbbf24", fontSize: 10, position: "insideTopLeft" }}
            />
          ) : null}
          {recommendedLabel && recommendedLabel !== currentLabel ? (
            <ReferenceLine
              x={recommendedLabel}
              stroke="#34d399"
              strokeDasharray="4 4"
              label={{ value: "Recommended", fill: "#34d399", fontSize: 10, position: "insideTopRight" }}
            />
          ) : null}
          <Area
            type="monotone"
            dataKey="risk"
            stroke="#8da2ff"
            strokeWidth={2.5}
            fill="url(#launchRiskFill)"
            activeDot={{ r: 5, fill: "#d9e0ff", stroke: "#667eea", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

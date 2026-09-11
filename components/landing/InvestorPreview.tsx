import { CalendarRange, Layers3, ShieldCheck, TrendingUp } from "lucide-react";

const CHART_POINTS = [
  { week: "W1", value: 34 },
  { week: "W3", value: 56 },
  { week: "W5", value: 82 },
  { week: "W7", value: 64 },
  { week: "W9", value: 28 },
  { week: "W11", value: 43 },
];

function MiniMetric({
  icon,
  label,
  value,
  detail,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "positive" | "caution";
}) {
  const toneClass = tone === "positive"
    ? "text-green"
    : tone === "caution"
      ? "text-yellow"
      : "text-on-surface";

  return (
    <div className="rounded-xl border border-outline-variant/35 bg-surface-container/80 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-on-surface-variant">{label}</p>
        <span className="text-primary">{icon}</span>
      </div>
      <p className={`mt-3 font-mono text-[18px] font-semibold tracking-tight ${toneClass}`}>{value}</p>
      <p className="mt-1 text-[10px] leading-relaxed text-on-surface-variant">{detail}</p>
    </div>
  );
}

export function InvestorPreview() {
  const width = 512;
  const height = 132;
  const paddingX = 18;
  const paddingY = 16;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const points = CHART_POINTS.map((point, index) => ({
    ...point,
    x: paddingX + (index / (CHART_POINTS.length - 1)) * chartWidth,
    y: paddingY + (1 - point.value / 100) * chartHeight,
  }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
  const areaPath = `${path} L${points.at(-1)?.x ?? width} ${height - paddingY} L${points[0].x} ${height - paddingY} Z`;

  return (
    <aside className="landing-preview relative rounded-[20px] border border-primary/25 bg-surface-container-low/95 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)] sm:p-5" aria-label="Illustrative ReleaseSignal analysis">
      <div className="flex flex-col justify-between gap-4 border-b border-outline-variant/35 pb-4 sm:flex-row sm:items-start">
        <div>
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-secondary">Illustrative analysis</p>
          <h2 className="mt-1.5 font-heading text-[17px] font-semibold tracking-tight text-on-surface">Launch decision overview</h2>
          <p className="mt-1 text-[11px] text-on-surface-variant">Co-op survival horror · PC · premium</p>
        </div>
        <div className="w-fit rounded-lg border border-yellow/25 bg-yellow/5 px-3 py-2 sm:text-right">
          <p className="font-mono text-[8px] uppercase tracking-[0.11em] text-on-surface-variant">Recommendation</p>
          <p className="mt-0.5 font-heading text-[20px] font-semibold text-yellow">MOVE</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 py-4">
        <MiniMetric icon={<TrendingUp size={14} />} label="Revenue range" value="$1.8–3.2M" detail="Modeled year one" />
        <MiniMetric icon={<ShieldCheck size={14} />} label="Confidence" value="Medium" detail="12 usable records" tone="positive" />
        <MiniMetric icon={<Layers3 size={14} />} label="Saturation" value="68 / 100" detail="Concentrated market" tone="caution" />
      </div>

      <figure className="rounded-xl border border-outline-variant/35 bg-surface-container/70 p-3.5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <figcaption className="text-[12px] font-semibold text-on-surface">Weekly launch-collision risk</figcaption>
            <p className="mt-0.5 text-[9px] text-on-surface-variant">Comparable pressure across candidate weeks</p>
          </div>
          <span className="rounded-md border border-green/25 bg-green/5 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.08em] text-green">
            Preferred · W9
          </span>
        </div>

        <svg viewBox={`0 0 ${width} ${height + 22}`} role="img" aria-label="Illustrative chart with launch collision risk peaking in week five and reaching its lowest point in week nine" className="mt-3 h-auto w-full overflow-visible">
          {[0, 1, 2].map((line) => {
            const y = paddingY + (line / 2) * chartHeight;
            return <line key={line} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#363842" strokeOpacity="0.75" />;
          })}
          <rect x={points[4].x - 31} y={paddingY - 4} width="62" height={chartHeight + 8} rx="7" fill="#34d399" fillOpacity="0.045" stroke="#34d399" strokeOpacity="0.18" />
          <path className="preview-chart-area" d={areaPath} fill="#6c8cff" fillOpacity="0.09" />
          <path className="preview-chart-line" d={path} fill="none" stroke="#6c8cff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => (
            <g key={point.week}>
              {index === 4 ? <circle cx={point.x} cy={point.y} r="4" fill="#34d399" stroke="#1a1c26" strokeWidth="2" /> : null}
              <text x={point.x} y={height + 16} fill={index === 4 ? "#34d399" : "#9da0ab"} fontSize="8" fontFamily="var(--font-jetbrains-mono)" textAnchor="middle">
                {point.week}
              </text>
            </g>
          ))}
        </svg>
      </figure>

      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-primary/15 bg-primary/5 p-3">
        <CalendarRange size={15} className="mt-0.5 shrink-0 text-primary" />
        <div>
          <p className="text-[11px] font-semibold text-on-surface">Shift the target window by 3–4 weeks</p>
          <p className="mt-0.5 text-[9px] leading-relaxed text-on-surface-variant">Lower modeled collision exposure while preserving pricing position.</p>
        </div>
        <span className="ml-auto shrink-0 font-mono text-[8px] uppercase tracking-[0.08em] text-on-surface-variant">Model output</span>
      </div>
    </aside>
  );
}

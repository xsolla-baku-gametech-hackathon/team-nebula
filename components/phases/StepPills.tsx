"use client";

type Step = "describe" | "comparables" | "launch-window";

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: "describe", label: "Describe", icon: "edit_note" },
  { id: "comparables", label: "Comparables", icon: "hub" },
  { id: "launch-window", label: "Analytics", icon: "query_stats" },
];

const ORDER: Record<Step, number> = { describe: 0, comparables: 1, "launch-window": 2 };

export default function StepPills({ active }: { active: Step }) {
  const activeIdx = ORDER[active];

  return (
    <div className="flex gap-1 mb-6">
      {STEPS.map((step, i) => {
        const isActive = i === activeIdx;
        const isComplete = i < activeIdx;
        const isLocked = i > activeIdx;

        return (
          <div
            key={step.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
              isActive ? "bg-primary/15 text-primary" :
              isComplete ? "text-green" :
              "text-on-surface-variant/50"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" style={isComplete ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {isComplete ? "check_circle" : isLocked ? "lock" : step.icon}
            </span>
            {step.label}
          </div>
        );
      })}
    </div>
  );
}

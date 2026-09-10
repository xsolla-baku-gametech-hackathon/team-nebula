"use client";

export type Step = "describe" | "comparables" | "launch-window";

const STEPS: { id: Step; label: string; icon: string }[] = [
  { id: "describe", label: "Describe", icon: "edit_note" },
  { id: "comparables", label: "Comparables", icon: "hub" },
  { id: "launch-window", label: "Analytics", icon: "query_stats" },
];

const ORDER: Record<Step, number> = { describe: 0, comparables: 1, "launch-window": 2 };

export default function StepPills({
  active,
  unlocked = [active],
  onNavigate,
}: {
  active: Step;
  unlocked?: Step[];
  onNavigate?: (step: Step) => void;
}) {
  const activeIdx = ORDER[active];
  const unlockedSet = new Set(unlocked);

  return (
    <nav aria-label="Analysis steps" className="flex gap-1 mb-6">
      {STEPS.map((step, i) => {
        const isActive = i === activeIdx;
        const isLocked = !unlockedSet.has(step.id);
        const isComplete = !isActive && !isLocked;

        return (
          <button
            type="button"
            key={step.id}
            disabled={isLocked}
            aria-current={isActive ? "step" : undefined}
            onClick={() => onNavigate?.(step.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
              isActive ? "bg-primary/15 text-primary" :
              isComplete ? "text-green" :
              "text-on-surface-variant/50"
            } disabled:cursor-not-allowed`}
          >
            <span className="material-symbols-outlined text-[16px]" style={isComplete ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {isComplete ? "check_circle" : isLocked ? "lock" : step.icon}
            </span>
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}

"use client";

type Step = "describe" | "comparables" | "launch-window";

const STEPS: { id: Step; label: string }[] = [
  { id: "describe", label: "Describe" },
  { id: "comparables", label: "Comparables" },
  { id: "launch-window", label: "Analytics" },
];

const ORDER: Record<Step, number> = { describe: 0, comparables: 1, "launch-window": 2 };

export default function StepPills({ active }: { active: Step }) {
  const activeIdx = ORDER[active];

  return (
    <div className="flex justify-center mb-10">
      <nav className="inline-flex h-11 bg-[#D9D9DE]/90 backdrop-blur-xl rounded-full p-1 gap-1 shadow-lg">
        {STEPS.map((step, i) => {
          const isActive = i === activeIdx;
          const isComplete = i < activeIdx;

          if (isActive) {
            return (
              <button key={step.id} className="h-full px-5 rounded-full bg-[#E4E6F0] shadow-sm flex items-center gap-1.5 text-[#1E1E2A] font-heading text-[13px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-inverse-primary animate-pulse" />
                {step.label}
              </button>
            );
          }
          if (isComplete) {
            return (
              <button key={step.id} className="h-full px-4 rounded-full flex items-center gap-1.5 text-[#1E1E2A]/60 text-[13px] font-medium">
                <span className="material-symbols-outlined text-[14px] text-[#237852]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {step.label}
              </button>
            );
          }
          return (
            <div key={step.id} className="h-full px-4 flex items-center text-[#8A8A98] text-[13px] opacity-70 cursor-not-allowed">
              {step.label}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

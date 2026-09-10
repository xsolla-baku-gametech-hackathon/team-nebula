"use client";

type Step = "describe" | "comparables" | "launch-window";

const STEPS: { id: Step; label: string; inactiveIcon?: string; stepNum: string }[] = [
  { id: "describe", label: "Describe", stepNum: "01" },
  { id: "comparables", label: "Comparables", inactiveIcon: "lock", stepNum: "02" },
  { id: "launch-window", label: "Launch window", inactiveIcon: "schedule", stepNum: "03" },
];

const ORDER: Record<Step, number> = { describe: 0, comparables: 1, "launch-window": 2 };

export default function StepPills({ active }: { active: Step }) {
  const activeIdx = ORDER[active];

  return (
    <header className="w-full flex justify-center pt-8 pb-14 sticky top-16 z-30 pointer-events-none">
      <nav className="pointer-events-auto w-[500px] h-14 bg-[#D9D9DE]/90 backdrop-blur-xl rounded-full p-1.5 flex items-center justify-between shadow-2xl border-t border-white/70">
        {STEPS.map((step, i) => {
          const isActive = i === activeIdx;
          const isComplete = i < activeIdx;

          if (isActive) {
            return (
              <button
                key={step.id}
                className="flex-1 h-full px-6 rounded-full bg-[#E4E6F0] shadow-[0_3px_10px_rgba(0,0,0,0.12)] flex items-center justify-center gap-2 text-[#1E1E2A] font-heading text-[13px] font-semibold transition-transform active:scale-95"
              >
                <span className="w-2 h-2 rounded-full bg-inverse-primary animate-pulse" />
                <span>{step.label}</span>
              </button>
            );
          }

          if (isComplete) {
            return (
              <button
                key={step.id}
                className="flex-1 h-full px-5 rounded-full flex items-center justify-center gap-1.5 text-[#1E1E2A]/70 hover:text-[#1E1E2A] transition-colors text-[14px] font-medium"
              >
                <span className="material-symbols-outlined text-[16px] text-[#237852]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>{step.label}</span>
              </button>
            );
          }

          return (
            <div key={step.id} className="flex-1 h-full px-5 flex items-center justify-center gap-1.5 text-[#8A8A98] text-[14px] select-none opacity-80 cursor-not-allowed">
              {step.inactiveIcon ? (
                <span className="material-symbols-outlined text-[16px]">{step.inactiveIcon}</span>
              ) : (
                <span className="font-mono text-[10px] font-medium leading-[12px]">{step.stepNum}</span>
              )}
              <span>{step.label}</span>
            </div>
          );
        })}
      </nav>
    </header>
  );
}

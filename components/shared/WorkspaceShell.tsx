"use client";

import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronRight,
  FileText,
  Layers3,
  Plus,
  ShieldCheck,
} from "lucide-react";
import type { Step } from "./StepPills";

const STEPS = [
  {
    id: "describe" as const,
    label: "Game concept",
    detail: "Define the player experience",
    icon: FileText,
  },
  {
    id: "comparables" as const,
    label: "Comparable games",
    detail: "Understand your market",
    icon: Layers3,
  },
  {
    id: "launch-window" as const,
    label: "Launch intelligence",
    detail: "Find your opening",
    icon: BarChart3,
  },
];

export function WorkspaceShell({
  active,
  unlocked,
  onNavigate,
  onStartNewSession,
  children,
}: {
  active: Step;
  unlocked: Step[];
  onNavigate: (step: Step) => void;
  onStartNewSession: () => void;
  children: ReactNode;
}) {
  const current = STEPS.find((step) => step.id === active)!;
  return (
    <div className="workspace">
      <aside className="ws-sidebar">
        <div className="ws-sidebar-top">
          <span className="ws-mark">
            <Layers3 size={18} />
          </span>
          <div>
            <strong>Analysis workspace</strong>
            <span>Your next release, informed.</span>
          </div>
        </div>
        <button type="button" className="ws-new" onClick={onStartNewSession}>
          <Plus size={16} /> New analysis <span>↗</span>
        </button>
        <p className="ws-nav-label">Your analysis</p>
        <nav aria-label="Analysis steps" className="ws-navigation">
          {STEPS.map((step, index) => {
            const locked = !unlocked.includes(step.id);
            const selected = active === step.id;
            return (
              <button
                key={step.id}
                type="button"
                disabled={locked}
                aria-current={selected ? "step" : undefined}
                onClick={() => onNavigate(step.id)}
                className={`ws-nav-item ${selected ? "is-active" : ""}`}
              >
                <step.icon size={18} aria-hidden="true" />
                <span>
                  <strong>{step.label}</strong>
                  <small>{step.detail}</small>
                </span>
                <span className="ws-nav-number">
                  {!selected && !locked ? <Check size={13} /> : `0${index + 1}`}
                </span>
              </button>
            );
          })}
        </nav>
        <div className="ws-sidebar-bottom">
          <ShieldCheck size={20} />
          <strong>Evidence before intuition.</strong>
          <p>
            Facts, estimates, and predictions stay clearly separated throughout
            your analysis.
          </p>
          <a
            href="https://store.steampowered.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore Steam <ArrowUpRight size={14} />
          </a>
        </div>
      </aside>
      <div className="ws-main">
        <div className="ws-topbar">
          <div>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{current.label}</strong>
          </div>
          <span className="ws-session-status">
            <span /> Saved on this device
          </span>
        </div>
        <div className="ws-content">{children}</div>
        <footer className="ws-footer">
          <span>ReleaseSignal</span>
          <span>Built for the decisions before launch.</span>
        </footer>
      </div>
    </div>
  );
}

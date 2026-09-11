"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DiscoveryValidation } from "@/lib/api/client";
import type {
  GameConcept,
  MarketReport,
  ScoredCompetitor,
  Snapshot,
} from "@/lib/domain/types";

export const SESSION_STORAGE_KEY = "releasesignal-session-v1";

export type SessionPhase = "landing" | "describe" | "comparables" | "analytics";

type SessionData = {
  phase: SessionPhase;
  description: string;
  genres: string[];
  concept: GameConcept | null;
  validation: DiscoveryValidation | null;
  questions: string[];
  competitors: ScoredCompetitor[];
  report: MarketReport | null;
  snapshot: Snapshot | null;
  resultsStale: boolean;
};

type SessionStore = SessionData & {
  hasHydrated: boolean;
  patchSession: (patch: Partial<SessionData>) => void;
  resetSession: () => void;
  rehydrateSession: () => Promise<void>;
};

const initialSession: SessionData = {
  phase: "landing",
  description: "",
  genres: [],
  concept: null,
  validation: null,
  questions: [],
  competitors: [],
  report: null,
  snapshot: null,
  resultsStale: false,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function sessionFromStorage(raw: string | null): SessionData {
  if (!raw) return initialSession;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isRecord(parsed.state)) return initialSession;
    const state = parsed.state;
    const phase: SessionPhase = ["landing", "describe", "comparables", "analytics"].includes(String(state.phase))
      ? state.phase as SessionPhase
      : "landing";
    return {
      phase,
      description: typeof state.description === "string" ? state.description : "",
      genres: Array.isArray(state.genres) ? state.genres.filter((item): item is string => typeof item === "string") : [],
      concept: isRecord(state.concept) ? state.concept as GameConcept : null,
      validation: isRecord(state.validation) ? state.validation as unknown as DiscoveryValidation : null,
      questions: Array.isArray(state.questions) ? state.questions.filter((item): item is string => typeof item === "string") : [],
      competitors: Array.isArray(state.competitors) ? state.competitors as ScoredCompetitor[] : [],
      report: isRecord(state.report) ? state.report as MarketReport : null,
      snapshot: isRecord(state.snapshot) ? state.snapshot as Snapshot : null,
      resultsStale: state.resultsStale === true,
    };
  } catch {
    return initialSession;
  }
}

function validRestoredPhase(state: SessionData): SessionPhase {
  if (state.phase === "analytics" && !state.report) {
    return state.competitors.length ? "comparables" : "describe";
  }
  if (state.phase === "comparables" && !state.competitors.length) return "describe";
  return state.phase;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      ...initialSession,
      hasHydrated: false,
      patchSession: (patch) => set(patch),
      resetSession: () => {
        set({ ...initialSession, hasHydrated: true });
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      },
      rehydrateSession: async () => {
        const restored = sessionFromStorage(window.localStorage.getItem(SESSION_STORAGE_KEY));
        set({
          ...restored,
          phase: validRestoredPhase(restored),
          hasHydrated: true,
        });
      },
    }),
    {
      name: SESSION_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
      skipHydration: true,
      partialize: (state) => ({
        phase: state.phase,
        description: state.description,
        genres: state.genres,
        concept: state.concept,
        validation: state.validation,
        questions: state.questions,
        competitors: state.competitors,
        report: state.report,
        snapshot: state.snapshot,
        resultsStale: state.resultsStale,
      }),
    },
  ),
);

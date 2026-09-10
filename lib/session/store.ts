"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { DiscoveryValidation } from "@/lib/api/client";
import type {
  GameConcept,
  MarketReport,
  ScoredCompetitor,
  Snapshot,
} from "@/lib/types";

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
        await useSessionStore.persist.rehydrate();
        const restored = useSessionStore.getState();
        set({
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

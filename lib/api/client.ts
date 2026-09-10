/**
 * Frontend API client — calls real backend routes.
 * Falls back gracefully if endpoints fail.
 */

import type { GameConcept, ScoredCompetitor, MarketReport, ClarifyingQuestion } from "@/lib/types";

export interface ConceptAnalyzeResult {
  concept: GameConcept;
  questions: ClarifyingQuestion[];
  readyToProceed: boolean;
}

export interface DiscoverResult {
  competitors: ScoredCompetitor[];
  totalCandidates: number;
}

export interface AnalyzeResult {
  report: MarketReport;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error?.message ?? "API error");
  return json.data as T;
}

/** Call /api/concept/analyze — extract concept from description text */
export async function analyzeDescription(
  text: string,
  previous?: GameConcept,
  answers?: Record<string, string>,
): Promise<ConceptAnalyzeResult> {
  return post<ConceptAnalyzeResult>("/api/concept/analyze", { text, previous, answers });
}

/** Call /api/discover — find comparable games from concept */
export async function discoverCompetitors(
  concept: GameConcept,
  limit = 12,
): Promise<DiscoverResult> {
  return post<DiscoverResult>("/api/discover", { concept, limit });
}

/** Call /api/analyze — run full market analysis */
export async function analyzeMarket(
  concept: GameConcept,
  competitorAppIds: number[],
  horizonWeeks = 26,
): Promise<AnalyzeResult> {
  return post<AnalyzeResult>("/api/analyze", { concept, competitorAppIds, horizonWeeks });
}

/**
 * Frontend API client — calls real backend routes.
 */

import type { CollectedGame } from "@/lib/collector/types";
import type {
  ClarifyingQuestion,
  GameConcept,
  MarketReport,
  NormalizedGame,
  ScoredCompetitor,
} from "@/lib/types";

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
  corpusVersion: string;
}

export interface DiscoveryTag {
  name: string;
  category: "genre" | "theme" | "mechanic" | "mode" | "perspective" | "setting" | "tone";
  priority: "required" | "preferred";
  basis: "explicit" | "inferred";
}

export interface DiscoveryValidation {
  status: "ready" | "needs_clarification";
  normalizedDescription: string;
  confidence: number;
  tags: DiscoveryTag[];
  mustHave: string[];
  avoid: string[];
  multiplayer: boolean | null;
  questions: string[];
}

export interface DiscoveryCandidate {
  steamAppId: number;
  igdbId: number;
  name: string;
  semanticScore: number;
  reason: string;
  matchedTags: string[];
}

export type DiscoveryPreviewResult = {
  status: "needs_clarification";
  previewId: null;
  expiresAt: null;
  query: string;
  validation: DiscoveryValidation;
  questions: string[];
} | {
  status: "ready_for_approval" | "no_matches";
  previewId: string | null;
  expiresAt: string | null;
  query: string;
  validation: DiscoveryValidation;
  candidates: DiscoveryCandidate[];
  discovery: {
    provider: "xai";
    model: string;
    candidateCount: number;
    rankedCount: number;
    requestedCount: number;
    returnedCount: number;
    complete: boolean;
    issues: string[];
  };
};

export type ApprovedGame = CollectedGame & {
  match: {
    source: "xai";
    reason: string;
    matchedTags: string[];
    candidateIgdbId: number;
    semanticScore: number;
  };
};

export interface ApprovalResult {
  query: string;
  validation: DiscoveryValidation;
  games: ApprovedGame[];
  failures: { steamAppId: number; code: string; message: string }[];
  approval: {
    previewId: string;
    approvedCount: number;
    returnedCount: number;
    complete: boolean;
  };
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type ApiEnvelope<T> = {
  data: T;
  meta: {
    durationMs: number;
    corpusVersion: string;
  };
};

async function postEnvelope<T>(url: string, body: unknown): Promise<ApiEnvelope<T>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.ok) {
    throw new ApiClientError(
      json?.error?.message ?? "The server returned an invalid response",
      json?.error?.code ?? "API_ERROR",
      res.status,
    );
  }
  return { data: json.data as T, meta: json.meta };
}

async function post<T>(url: string, body: unknown): Promise<T> {
  return (await postEnvelope<T>(url, body)).data;
}

/** Call /api/concept/analyze — extract concept from description text. */
export async function analyzeDescription(
  text: string,
  previous?: GameConcept,
  answers?: Record<string, string>,
): Promise<ConceptAnalyzeResult> {
  return post<ConceptAnalyzeResult>("/api/concept/analyze", { text, previous, answers });
}

/** Legacy corpus search retained for compatibility with existing callers. */
export async function discoverCompetitors(
  concept: GameConcept,
  limit = 12,
): Promise<DiscoverResult> {
  return post<DiscoverResult>("/api/discover", { concept, limit });
}

/** Validate a description with Grok and return names for explicit approval. */
export async function discoverGamePreview(
  query: string,
  clarifications: { question: string; answer: string }[] = [],
  limit = 10,
): Promise<DiscoveryPreviewResult> {
  return post<DiscoveryPreviewResult>("/api/games/discover", {
    query,
    limit,
    ...(clarifications.length ? { clarifications } : {}),
  });
}

/** Collect live details only for candidates approved from a prior preview. */
export async function collectApprovedGames(
  previewId: string,
  selectedSteamAppIds: number[],
): Promise<ApprovalResult> {
  return post<ApprovalResult>("/api/games/discover/collect", {
    previewId,
    selectedSteamAppIds,
  });
}

/** Call /api/analyze with the live comparable records from collection. */
export async function analyzeMarket(
  concept: GameConcept,
  comparables: NormalizedGame[] | number[],
  horizonWeeks = 26,
): Promise<AnalyzeResult> {
  const games = comparables as (NormalizedGame | number)[];
  const input = typeof games[0] === "number"
    ? { concept, competitorAppIds: games, horizonWeeks }
    : { concept, comparables: games, horizonWeeks };
  const response = await postEnvelope<{ report: MarketReport }>("/api/analyze", input);
  return {
    report: response.data.report,
    corpusVersion: response.meta.corpusVersion,
  };
}

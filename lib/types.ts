// ── Provenance primitives ──────────────────────────────────────────

/**
 * The provenance source for a numeric or text fact.
 * This lets the app distinguish raw Steam data from model estimates or user input.
 */
export type Source =
  | 'steam'
  | 'igdb'
  | 'gamalytic'
  | 'releasesignal'
  | 'user';

/**
 * Wraps a value with provenance metadata so every displayed fact can be traced back to its source.
 * The `estimated` flag tells whether the value came from a model rather than a direct source.
 */
export type Sourced<T> = {
  value: T | null;
  source: Source;
  estimated: boolean;
  method?: string;
};

// ── Enums ──────────────────────────────────────────────────────────

export type Platform = 'PC' | 'Mac' | 'Linux' | 'Switch' | 'PS5' | 'Xbox';

export type GameMode =
  | 'Singleplayer'
  | 'Online Co-op'
  | 'Local Co-op'
  | 'Online PvP'
  | 'Local PvP'
  | 'MMO';

export type Perspective =
  | 'First person'
  | 'Third person'
  | 'Isometric'
  | 'Side view'
  | 'Top down'
  | 'Text';

export type ConceptField =
  | 'primaryGenre'
  | 'mechanics'
  | 'gameModes'
  | 'perspective'
  | 'priceUsd'
  | 'plannedRelease'
  | 'platforms';

// ── GameConcept ────────────────────────────────────────────────────
/**
 * Stores the game concept described by the user.
 */
export type GameConcept = {
  version: number;

  concept: {
    title: string | null;
    shortDescription: string;
    rawText: string;
    platforms: Platform[];
    targetSteam: boolean;
  };

  taxonomy: {
    primaryGenre: string | null;
    secondaryGenres: string[];
    themes: string[];
    mechanics: string[];
    gameModes: GameMode[];
    perspective: Perspective | null;
  };

  commercial: {
    priceUsd: number | null;
    plannedRelease: string | null;
    teamSize: number | null;
    isFirstTitle: boolean | null;
  };

  confidence: Partial<Record<ConceptField, number>>;
  missingImportantFields: ConceptField[];
};

// ── NormalizedGame ─────────────────────────────────────────────────

/**
 * A single time-series point, typically used for CCU or revenue history over time.
 */
export type TimePoint = { t: string; v: number };

/**
 * A normalized Steam title after ingestion and cleaning.
 * This is the canonical shape used for corpus matching, scoring, and reporting.
 */
export type NormalizedGame = {
  identity: {
    steamAppId: number;
    igdbId: number | null;
    name: string;
    steamUrl: string;
  };

  metadata: {
    summary: string;
    genres: string[];
    themes: string[];
    tags: string[];
    keywords: string[];
    gameModes: GameMode[];
    perspectives: Perspective[];
    platforms: Platform[];
    developers: string[];
    publishers: string[];
  };

  release: {
    date: string | null;
    isReleased: boolean;
    isEarlyAccess: boolean;
  };

  commercial: {
    priceUsd: Sourced<number>;
    estimatedCopiesSold: Sourced<number>;
    estimatedRevenueUsd: Sourced<number>;
  };

  reviews: {
    total: Sourced<number>;
    positive: Sourced<number>;
    negative: Sourced<number>;
    positiveRatio: Sourced<number>;
    sentimentSummary: Sourced<string>;
  };

  history?: {
    peakCcu: TimePoint[];
    revenue: TimePoint[];
  };
};

// ── ScoredCompetitor ───────────────────────────────────────────────

/**
 * The weighted pieces that make up a similarity score between
 *  the user's game concept and a candidate title.
 */
export type SimilarityComponents = {
  semantic: number;
  mechanics: number;
  genre: number;
  theme: number;
  gameMode: number;
  price: number;
};

/**
 * A comparable game candidate after matching and ranking against the user's concept.
 * Includes the game data and the model's explanation of why it is relevant.
 */
export type ScoredCompetitor = {
  game: NormalizedGame;

  similarity: {
    score: number;
    components: SimilarityComponents;
    rationale: string;
  };

  competitiveThreat: number;
  userAdded: boolean;
};

// ── Driver ─────────────────────────────────────────────────────────

/**
 * A named explanation for a market score.
 * Used to show why a result changed, 
 * such as a crowded release week or high similarity to a competitor.
 */
export type Driver = {
  label: string;
  contribution: number;
  detail: string;
};

// ── MarketReport ───────────────────────────────────────────────────

export type ConfidenceBand = 'LOW' | 'MEDIUM' | 'HIGH';
export type SaturationBand = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type RiskBand = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type Verdict = 'KEEP' | 'MOVE' | 'MITIGATE';

/**
 * A future Steam title that may overlap with the user's planned launch window.
 * Used to model competitive pressure in the forecast.
 */
export type UpcomingRelease = {
  steamAppId: number;
  name: string;
  expectedDate: string;
  dateConfidence: 'exact' | 'month' | 'quarter' | 'vague';
  similarity: number;
  threat: number;
  followers: number | null;
  isMajorPublisher: boolean;
};

/**
 * A time bucket representing a risk analysis window with competing releases and explanatory drivers.
 */
export type ReleaseWindow = {
  weekStart: string;
  weekEnd: string;
  risk: number;
  band: RiskBand;
  competingReleases: UpcomingRelease[];
  drivers: Driver[];
};

export type ReleaseWindowRisk = {
	windows: ReleaseWindow[]; 
	verdict: 
	{ 
		decision: Verdict;
		currentDate: string | null;
		recommendedDate: string | null;
		reasoning: string[];
	}

}

export type MarketReport = {
  saturation: {
    score: number;
    band: SaturationBand;
    drivers: Driver[];
  };

  revenue: {
    conservative: number;
    base: number;
    upside: number;
    currency: 'USD';
    confidence: ConfidenceBand;
    basedOnCount: number;
    method: string;
  };

  reception: {
    predictedPositiveRatio: number;
    cohortMedian: number;
    band: ConfidenceBand;
  };

  releaseWindows: ReleaseWindow[];

  verdict: {
    decision: Verdict;
    currentDate: string | null;
    recommendedDate: string | null;
    reasoning: string[];
  };
};

// ── Snapshot ───────────────────────────────────────────────────────

/**
 * A frozen analysis artifact representing one complete concept-to-forecast session.
 * It is used for reproducibility and for preserving a calculated report snapshot.
 */
export type Snapshot = {
  snapshotId: string;
  generatedAt: string;
  conceptVersion: number;
  concept: GameConcept;
  competitors: ScoredCompetitor[];
  report: MarketReport;
  corpusVersion: string;
};

// ── EstimatedPlayerReception ────────────────────────────────────────────────────

/**
 * The estimated reception of the game described by the player.
 */
export type EstimatedPlayerReception = {
	predictedPositiveRatio: number;
	cohortMedianPositiveRatio: number; 
	band: ConfidenceBand
}

// ── EstimatedRevenue ────────────────────────────────────────────────────

export type EstimatedRevenue = {
	conservative: number;
	base: number;
	upside: number;
	confidence: ConfidenceBand;
	basedOnCount: number;
	method: string;
	drivers: Driver[];
}

// ── API envelope ───────────────────────────────────────────────────

export type DegradedFlag =
  | 'llm_fallback'
  | 'embedding_fallback'
  | 'no_gamalytic';

export type ErrorCode =
  | 'INVALID_INPUT'
  | 'CORPUS_UNAVAILABLE'
  | 'AI_UNAVAILABLE'
  | 'INTERNAL';

export type ResponseMeta = {
  durationMs: number;
  corpusVersion: string;
  degraded?: DegradedFlag[];
};

export type ApiError = {
  code: ErrorCode;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> =
  | { ok: true; data: T; meta: ResponseMeta }
  | { ok: false; error: ApiError };

// ── Clarifying questions ───────────────────────────────────────────

export type ClarifyingQuestion = {
  field: ConceptField;
  question: string;
  suggestions?: string[];
  skippable: true;
};

// ── Corpus file meta ───────────────────────────────────────────────

export type CorpusMeta = {
  corpusVersion: string;
  count: number;
  embeddingModel: string;
  dims: number;
  enrichedCount: number;
};

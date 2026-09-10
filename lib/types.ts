// ── Provenance primitives ──────────────────────────────────────────

export type Source =
  | 'steam'
  | 'igdb'
  | 'gamalytic'
  | 'releasesignal'
  | 'user';

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

export type TimePoint = { t: string; v: number };

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

export type SimilarityComponents = {
  semantic: number;
  mechanics: number;
  genre: number;
  theme: number;
  gameMode: number;
  price: number;
};

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

export type ReleaseWindow = {
  weekStart: string;
  weekEnd: string;
  risk: number;
  band: RiskBand;
  competingReleases: UpcomingRelease[];
  drivers: Driver[];
};

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

export type Snapshot = {
  snapshotId: string;
  generatedAt: string;
  conceptVersion: number;
  concept: GameConcept;
  competitors: ScoredCompetitor[];
  report: MarketReport;
  corpusVersion: string;
};

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

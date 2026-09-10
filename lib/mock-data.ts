/**
 * Mock data for the full frontend workflow.
 *
 * Every service response is faked here so the demo flows end-to-end
 * without any backend. Replace individual blocks with real API calls
 * when the services are ready.
 */

/* ═══════════════════════════════════════════════════════
   SECTION 1 — user-game-analyzer service
   ═══════════════════════════════════════════════════════ */

export interface AnalysisResponse {
  /** true when the description has enough info to proceed */
  sufficient: boolean;
  /** follow-up questions if not sufficient */
  questions: string[];
  /** auto-extracted genres (populates Section 2) */
  genres: string[];
  /** auto-suggested similar games (populates Section 2) */
  suggestedGames: string[];
}

/** First analysis — description is too short / vague */
export const ANALYSIS_INSUFFICIENT: AnalysisResponse = {
  sufficient: false,
  questions: [
    "How many players does this support? (solo / co-op / multiplayer)",
    "What is the average session length?",
    "What is your target price point?",
  ],
  genres: [],
  suggestedGames: [],
};

/** Second analysis — enough info, auto-populate Section 2 */
export const ANALYSIS_SUFFICIENT: AnalysisResponse = {
  sufficient: true,
  questions: [],
  genres: ["Horror", "Co-op", "Survival", "Atmospheric"],
  suggestedGames: ["Lethal Company", "Barotrauma", "Phasmophobia"],
};

/* ═══════════════════════════════════════════════════════
   SECTION 2 — automatic-steam-db-search-tags / games
   ═══════════════════════════════════════════════════════ */

export const GENRE_SUGGESTIONS = [
  "Survival", "Atmospheric", "Psychological Horror", "Co-op",
  "Roguelike", "Indie", "First-Person", "Multiplayer",
];

export const GAME_SUGGESTIONS = [
  "Barotrauma", "Lethal Company", "Subnautica", "Phasmophobia",
  "The Outlast Trials", "GTFO", "Deep Rock Galactic", "We Need to Go Deeper",
];

/* ═══════════════════════════════════════════════════════
   SECTION 3 — similar-games-data-collector service
   All 10 fields from spec per comparable game.
   ═══════════════════════════════════════════════════════ */

export interface ComparableGame {
  /** 1) Game name */
  name: string;
  /** 2) Release date */
  releaseDate: string;
  /** 3) Price */
  price: string;
  /** 4) Est. Revenue */
  estRevenue: string;
  /** 5) Steam page link */
  steamUrl: string;
  /** 6) Reviews (count + sentiment) */
  reviews: string;
  reviewScore: number; // 0-100
  /** 7) Tags */
  tags: string[];
  /** 8) Est. Copies sold */
  estCopies: string;
  /** 9) Sales history data (for graph) */
  salesHistory: { month: string; units: number }[];
  /** 10) Game Description */
  description: string;
  /** Display helpers */
  color: string;
  initials: string;
}

export const COMPARABLE_GAMES: ComparableGame[] = [
  {
    name: "Lethal Company",
    releaseDate: "Oct 2023",
    price: "$9.99",
    estRevenue: "$68M",
    steamUrl: "https://store.steampowered.com/app/1966720",
    reviews: "186,420",
    reviewScore: 96,
    tags: ["Horror", "Co-op", "Online Co-Op", "Multiplayer"],
    estCopies: "6.8M",
    salesHistory: [
      { month: "Oct 23", units: 820000 }, { month: "Nov 23", units: 2100000 },
      { month: "Dec 23", units: 1900000 }, { month: "Jan 24", units: 680000 },
      { month: "Feb 24", units: 340000 }, { month: "Mar 24", units: 210000 },
    ],
    description: "A co-op horror game about scavenging at abandoned moons to sell scrap to the Company.",
    color: "#4A3728",
    initials: "LC",
  },
  {
    name: "Barotrauma",
    releaseDate: "Mar 2023",
    price: "$29.99",
    estRevenue: "$28M",
    steamUrl: "https://store.steampowered.com/app/602960",
    reviews: "42,870",
    reviewScore: 88,
    tags: ["Survival", "Co-op", "Submarine", "Horror"],
    estCopies: "940K",
    salesHistory: [
      { month: "Mar 23", units: 180000 }, { month: "Apr 23", units: 95000 },
      { month: "May 23", units: 72000 }, { month: "Jun 23", units: 58000 },
      { month: "Jul 23", units: 65000 }, { month: "Aug 23", units: 51000 },
    ],
    description: "A 2D co-op submarine simulator set on Jupiter's moon Europa. Manage your crew and survive.",
    color: "#1E3F4B",
    initials: "BT",
  },
  {
    name: "Phasmophobia",
    releaseDate: "Sep 2020",
    price: "$13.99",
    estRevenue: "$112M",
    steamUrl: "https://store.steampowered.com/app/739630",
    reviews: "298,540",
    reviewScore: 90,
    tags: ["Horror", "Co-op", "Online Co-Op", "Psychological Horror"],
    estCopies: "8.0M",
    salesHistory: [
      { month: "Sep 20", units: 450000 }, { month: "Oct 20", units: 3200000 },
      { month: "Nov 20", units: 1100000 }, { month: "Dec 20", units: 780000 },
      { month: "Jan 21", units: 420000 }, { month: "Feb 21", units: 310000 },
    ],
    description: "4-player online co-op ghost hunting game. Use ghost hunting equipment to find paranormal activity.",
    color: "#2A1F3D",
    initials: "PH",
  },
  {
    name: "GTFO",
    releaseDate: "Dec 2021",
    price: "$39.99",
    estRevenue: "$18M",
    steamUrl: "https://store.steampowered.com/app/493520",
    reviews: "28,910",
    reviewScore: 82,
    tags: ["Horror", "Co-op", "FPS", "Difficult"],
    estCopies: "450K",
    salesHistory: [
      { month: "Dec 21", units: 120000 }, { month: "Jan 22", units: 68000 },
      { month: "Feb 22", units: 42000 }, { month: "Mar 22", units: 31000 },
      { month: "Apr 22", units: 28000 }, { month: "May 22", units: 22000 },
    ],
    description: "Hardcore 4-player co-op action horror FPS. Work together to explore hostile environments.",
    color: "#8B2500",
    initials: "GT",
  },
  {
    name: "The Outlast Trials",
    releaseDate: "Mar 2024",
    price: "$29.99",
    estRevenue: "$22M",
    steamUrl: "https://store.steampowered.com/app/1304930",
    reviews: "34,220",
    reviewScore: 79,
    tags: ["Horror", "Co-op", "Survival Horror", "Stealth"],
    estCopies: "730K",
    salesHistory: [
      { month: "Mar 24", units: 210000 }, { month: "Apr 24", units: 140000 },
      { month: "May 24", units: 98000 }, { month: "Jun 24", units: 72000 },
      { month: "Jul 24", units: 55000 }, { month: "Aug 24", units: 41000 },
    ],
    description: "Cold War era co-op survival horror. Subjects undergo mind-control experiments in Murkoff facilities.",
    color: "#6E2631",
    initials: "OT",
  },
  {
    name: "We Need to Go Deeper",
    releaseDate: "Nov 2019",
    price: "$14.99",
    estRevenue: "$2.4M",
    steamUrl: "https://store.steampowered.com/app/307110",
    reviews: "3,870",
    reviewScore: 84,
    tags: ["Co-op", "Submarine", "Roguelike", "Adventure"],
    estCopies: "160K",
    salesHistory: [
      { month: "Nov 19", units: 38000 }, { month: "Dec 19", units: 24000 },
      { month: "Jan 20", units: 14000 }, { month: "Feb 20", units: 9000 },
      { month: "Mar 20", units: 7500 }, { month: "Apr 20", units: 6200 },
    ],
    description: "2-4 player co-op submarine roguelike. Dive into the depths, fight monsters, survive together.",
    color: "#5B6A47",
    initials: "WN",
  },
];

/* ═══════════════════════════════════════════════════════
   SECTION 4 — Prediction services (Analytics tab)
   ═══════════════════════════════════════════════════════ */

/** Service 1: Revenue / copies / cost prediction */
export const PREDICTION_REVENUE = {
  estRevenue: "$3.2M",
  estCopies: "210K",
  bestPrice: "$14.99",
  avgPrice: "$17.49",
};

/** Service 2: Release window prediction */
export const PREDICTION_RELEASE_WINDOW = {
  bestWeek: "Oct 26 – Nov 1, 2026",
  weekNumber: 44,
  year: 2026,
  verdict: "KEEP" as const,
  reason: "Lowest genre overlap in Q4. No major co-op horror releases in this window.",
};

/** Service 3: Sentiment / reviews prediction */
export const PREDICTION_SENTIMENT = {
  positivePercent: 78,
  label: "Very Positive",
  estReviewCount: "4,200",
  reasoning: "Strong co-op horror niche with novel submarine mechanics differentiates from saturated ghost-hunt sub-genre.",
};

/** Service 4: Market saturation */
export const PREDICTION_SATURATION = {
  level: "Moderate" as const,
  score: 62, // 0-100, higher = more saturated
  weeklyData: [
    { week: "W36", releases: 3 }, { week: "W37", releases: 5 },
    { week: "W38", releases: 2 }, { week: "W39", releases: 4 },
    { week: "W40", releases: 7 }, { week: "W41", releases: 3 },
    { week: "W42", releases: 8 }, { week: "W43", releases: 6 },
    { week: "W44", releases: 1 }, { week: "W45", releases: 4 },
    { week: "W46", releases: 3 }, { week: "W47", releases: 5 },
  ],
  insight: "Co-op horror releases spike in Oct (Halloween). Week 44 has a clear gap.",
};

/** Service 6: Success % prediction */
export const PREDICTION_SUCCESS = {
  percent: 72,
  label: "Above average",
  reasoning: "Submarine setting is under-explored in co-op horror. Price point ($14.99) hits the sweet spot for the genre.",
};

/* ═══════════════════════════════════════════════════════
   SESSION IMPORT — example JSON shape
   ═══════════════════════════════════════════════════════ */

export interface SessionData {
  description: string;
  genres: string[];
  similarGames: string[];
}

export const EXAMPLE_SESSION: SessionData = {
  description:
    "Players navigate claustrophobic submarine corridors in 4-player co-op, managing oxygen pressure while evading bioluminescent abyssal predators. Tension comes from asynchronous audio pings and tactile lever controls. Sessions are 30-40 min. PC first, targeting $14.99.",
  genres: ["Horror", "Co-op", "Survival", "Atmospheric"],
  similarGames: ["Lethal Company", "Barotrauma", "Phasmophobia"],
};

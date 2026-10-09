# Graph Report - Ludiqentra  (2026-10-09)

## Corpus Check
- 233 files · ~151,459 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .ico 1)

## Summary
- 1259 nodes · 2183 edges · 118 communities (103 shown, 15 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.86)
- Token cost: unavailable for host-agent semantic extraction; no external LLM API was called.

## Community Hubs (Navigation)
- schemas.ts
- zod
- fetch-igdb-mcp.ts
- Deterministic scoring
- Scoring models
- Decision records
- GameConcept
- page.tsx
- AnalyticsPhase.tsx
- DescribePhase.tsx
- collector/types.ts
- mcp/client.ts
- normalize-game.ts
- NormalizedGame
- package.json
- vitest
- compilerOptions
- domain/types.ts
- scoring/index.ts
- MarketReport
- ProviderError
- dependencies
- scripts
- CompetitorCard.tsx
- upcoming-releases.ts
- devDependencies
- release-risk.ts
- SaturationPanel.tsx
- HTTP API
- reviews.ts
- store.ts
- ReleaseSignal
- Comparable review screenshot
- revenue.ts
- ReleaseSignal design system
- Application page dependency tree
- WelcomePhase.tsx
- Comparable games screen
- Live collector
- Architecture-aligned testing
- ScoredCompetitor
- react
- ReleaseSignal architecture
- Investor demo flow
- Two-stage live game discovery
- CI verification
- ReleaseSignal theme
- Launch calendar prototype
- ReleaseSignal welcome screen
- ReleaseSignal candidate weeks screen
- ReleaseSignal candidate weeks screen
- ReleaseSignal welcome screen
- Live game data collector
- Provider ownership
- launch-inputs.ts
- Shared UI components
- App Router route map
- json/route.ts
- Comparable review prototype
- Welcome prototype
- Filled description screen
- Description screen
- Live collector
- Demo runbook
- Project contribution rules
- Description prototype
- ReleaseSignal description screen
- Concept extraction
- Field provenance
- Immutable corpus
- Preview request
- IGDB MCP endpoint
- Pending preview Map
- similar-games-data-collector
- igdb-client.ts
- Root application shell
- Hackathon code of conduct
- Atomic preview claim
- Grok description validation
- Discovery errors
- Free Steam-game list
- Deterministic verification
- Discovery preview
- Collection sources
- Provider request gates
- Backend reference
- Steam field mapping
- Exact Steam identity resolution
- Discovery tag semantics
- analyze-market.ts
- steam-client.ts
- mcp/client.test.ts
- Next.js agent rules
- TaxonomyEditor.tsx
- ReleaseSignal vector logo
- ReleaseSignal raster logo
- Live interactive flow
- Grok ranking
- Fresh validation
- ReleaseSignal logo
- Window icon
- API response envelope
- Structured-output schemas
- prompts/extract-concept.ts
- pnpm workspace build approvals
- Globe vector icon
- import-document.ts
- patch-concept.ts
- postcss.config.mjs
- Vercel vector mark
- Review sentiment
- Folded document SVG icon
- Next.js wordmark

## God Nodes (most connected - your core abstractions)
1. `vitest` - 39 edges
2. `GameConcept` - 29 edges
3. `ReleaseSignal` - 24 edges
4. `Deterministic scoring` - 23 edges
5. `ProviderError` - 22 edges
6. `parseProvider()` - 21 edges
7. `ScoredCompetitor` - 20 edges
8. `NormalizedGame` - 19 edges
9. `Home()` - 19 edges
10. `requestText()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Props` --references--> `GameConcept`  [EXTRACTED]
  components/analysis/AnalyticsPhase.tsx → lib/domain/types.ts
- `Props` --references--> `MarketReport`  [EXTRACTED]
  components/analysis/AnalyticsPhase.tsx → lib/domain/types.ts
- `Props` --references--> `ScoredCompetitor`  [EXTRACTED]
  components/analysis/AnalyticsPhase.tsx → lib/domain/types.ts
- `Props` --references--> `ReleaseWindow`  [EXTRACTED]
  components/analysis/LaunchRiskChart.tsx → lib/domain/types.ts
- `Props` --references--> `ScoredCompetitor`  [EXTRACTED]
  components/analysis/ComparableRevenueChart.tsx → lib/domain/types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Approval gated discovery** — docs_discovery_validation, docs_discovery_preview, docs_discovery_approval, docs_discovery_collection [EXTRACTED 1.00]
- **Weekly decision explanation 8** — data_stitch_review_04_launch_window_weekly_cards, data_stitch_review_04_launch_window_expanded_week, data_stitch_review_04_launch_window_verdict_badges, data_stitch_review_04_launch_window_provenance [EXTRACTED 1.00]
- **Weekly decision explanation 11** — data_stitch_screenshots_launch_window_weekly_cards, data_stitch_screenshots_launch_window_expanded_week, data_stitch_screenshots_launch_window_verdict_badges, data_stitch_screenshots_launch_window_provenance [EXTRACTED 1.00]
- **Approval-gated discovery and collection flow** — docs_backend_reference_architecture_grok_validation, docs_backend_reference_architecture_igdb_mcp_search, docs_backend_reference_architecture_grok_ranking, docs_backend_reference_architecture_steam_identity_resolution, docs_backend_reference_architecture_pending_preview, docs_backend_reference_architecture_user_approval, docs_backend_reference_architecture_live_collector [EXTRACTED 1.00]
- **Typed analysis snapshot** — docs_data_model_gameconcept, docs_data_model_scoredcompetitor, docs_data_model_marketreport, docs_data_model_snapshot [EXTRACTED 1.00]

## Communities (118 total, 15 thin omitted)

### Community 0 - "schemas.ts"
Cohesion: 0.06
Nodes (49): headers, maxDuration, POST(), runtime, headers, maxDuration, POST(), runtime (+41 more)

### Community 1 - "zod"
Cohesion: 0.06
Nodes (32): maxDuration, POST(), runtime, Schema, POST(), Schema, POST(), POST() (+24 more)

### Community 2 - "fetch-igdb-mcp.ts"
Cohesion: 0.06
Nodes (38): dotenv, @modelcontextprotocol/sdk, playwright, main(), main(), buildLookup(), DATA_DIR, fetchGames() (+30 more)

### Community 3 - "Deterministic scoring"
Cohesion: 0.08
Nodes (33): CompetitorCard, DriverList, Extractable components, LoadingSkeleton, ProvenanceTag, ReleaseCalendar, RevenueRange, RootProductHeader (+25 more)

### Community 4 - "Scoring models"
Cohesion: 0.07
Nodes (17): Continuous integration checks, Contributing conventions, Driver contributions, ProvenanceTag, Corpus build pipeline, Offline Python pipeline, Upcoming releases with date precision, Scoring models (+9 more)

### Community 5 - "Decision records"
Cohesion: 0.08
Nodes (16): Data model, Driver, GameConcept, MarketReport, NormalizedGame, ReleaseWindow, ScoredCompetitor, Sourced<T> (+8 more)

### Community 6 - "GameConcept"
Cohesion: 0.12
Nodes (20): ConceptAnalyzeResult, fallbackExtract(), GENRE_KEYWORDS, MECHANIC_KEYWORDS, MODE_MAP, PERSPECTIVE_MAP, ClarifyingQuestion, ConceptField (+12 more)

### Community 7 - "page.tsx"
Cohesion: 0.15
Nodes (23): AnalyticsPhase, buildQuery(), ComparablesPhase, DiscoveryStage, errorMessage(), fallbackConcept(), Home(), PhaseLoader() (+15 more)

### Community 8 - "AnalyticsPhase.tsx"
Cohesion: 0.15
Nodes (21): AnalyticsPhase(), Donut(), EvidenceMetric(), fmt(), Props, sentimentLabel(), verdictTone(), ExportBar() (+13 more)

### Community 9 - "DescribePhase.tsx"
Cohesion: 0.14
Nodes (21): Card(), ComparablesPhase(), fmt(), fmtCount(), steamHeaderUrl(), AddInput(), CandidateReview(), DescribePhase() (+13 more)

### Community 10 - "collector/types.ts"
Cohesion: 0.15
Nodes (17): headers, maxDuration, POST(), runtime, defaults, collectGames(), unpack(), CollectorProviders (+9 more)

### Community 11 - "mcp/client.ts"
Cohesion: 0.16
Nodes (16): providerGate(), fetchIgdb(), Game, id, IgdbBatch, IgdbMetadata, relations, Links (+8 more)

### Community 12 - "normalize-game.ts"
Cohesion: 0.15
Nodes (18): ApprovalProviders, Source, Enrichment, modes, normalizeGame(), perspectives, sourced(), CollectionResult (+10 more)

### Community 13 - "NormalizedGame"
Cohesion: 0.18
Nodes (11): rankCorpus(), scoreCompetitor(), ComponentEntry, genreScore(), jaccard(), priceComponent(), scoreSimilarity(), validPrice() (+3 more)

### Community 14 - "package.json"
Cohesion: 0.10
Nodes (19): eslintConfig, name, packageManager, private, version, @ai-sdk/xai, eslint, eslint-config-next (+11 more)

### Community 15 - "vitest"
Cohesion: 0.18
Nodes (9): RequestGate, requestText(), sleep(), SPACING, Provider, fetchSteamTags(), parseSteamTags(), cheerio (+1 more)

### Community 16 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 17 - "domain/types.ts"
Cohesion: 0.14
Nodes (11): MESSAGES, scoreReception(), ApiError, ApiResponse, ConfidenceBand, DegradedFlag, ErrorCode, EstimatedPlayerReception (+3 more)

### Community 18 - "scoring/index.ts"
Cohesion: 0.23
Nodes (11): estimateCopies(), estimateRevenue(), multiplierForPrice(), MULTIPLIERS, driver(), sumDrivers(), band(), clamp() (+3 more)

### Community 19 - "MarketReport"
Cohesion: 0.17
Nodes (9): fmt(), RevenueRange(), VERDICT_COLORS, MarketReport, createSnapshot(), deepFreeze(), isRecord(), snapshotFromImport() (+1 more)

### Community 20 - "ProviderError"
Cohesion: 0.24
Nodes (12): parseJson(), parseProvider(), ProviderError, appId, estimate, fetchGamalytic(), GamalyticBatch, GamalyticGame (+4 more)

### Community 21 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, ai, @ai-sdk/xai, cheerio, clsx, lucide-react, @modelcontextprotocol/sdk, nanoid (+8 more)

### Community 22 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, collector:smoke, corpus:embed, corpus:fetch, corpus:fetch:steam, corpus:verify, dev (+8 more)

### Community 23 - "CompetitorCard.tsx"
Cohesion: 0.23
Nodes (10): CompetitorCard(), formatCount(), formatRevenue(), CompetitorDrawer(), CompetitorGrid(), LABELS, SimilarityBadge(), ProvenanceTag() (+2 more)

### Community 24 - "upcoming-releases.ts"
Cohesion: 0.21
Nodes (14): buildQuery(), DateWindow, fetchUpcomingReleases(), isoDate(), monthNumbers, plusDays(), popularityThreat(), ReleaseDateRow (+6 more)

### Community 25 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, dotenv, eslint, eslint-config-next, @phalcode/ts-igdb-client, playwright, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 26 - "release-risk.ts"
Cohesion: 0.21
Nodes (10): clamp(), DATE_CONFIDENCE_WEIGHT, iso(), riskBand(), scoreReleaseRisk(), weekStart(), ReleaseWindowRisk, RiskBand (+2 more)

### Community 27 - "SaturationPanel.tsx"
Cohesion: 0.26
Nodes (8): SaturationPanel(), DriverList(), LoadingSkeleton(), BAND_COLORS, ScoreBar(), cn(), clsx, tailwind-merge

### Community 28 - "HTTP API"
Cohesion: 0.17
Nodes (12): Candidate approval, Clarifying questions, Description validation, GET /api/health, HTTP API, JSON response envelope, Live normalized records, POST /api/analyze (+4 more)

### Community 29 - "reviews.ts"
Cohesion: 0.23
Nodes (9): ReviewComment, CommentSchema, count, fetchSteamComments(), fetchSteamReviews(), parseReviewComments(), parseReviewSummary(), ReviewSummary (+1 more)

### Community 30 - "store.ts"
Cohesion: 0.23
Nodes (10): initialSession, isRecord(), SESSION_STORAGE_KEY, SessionData, sessionFromStorage(), SessionPhase, SessionStore, useSessionStore (+2 more)

### Community 31 - "ReleaseSignal"
Cohesion: 0.17
Nodes (12): 26–52 week calendar, Approval-gated collection, Browser localStorage, Gamalytic estimates, Gameplay-based comparables, Grok description validation, IGDB MCP discovery, Immutable exports (+4 more)

### Community 32 - "Comparable review screenshot"
Cohesion: 0.18
Nodes (11): Abyssal Echoes, Cohort median strip, Comparable review screenshot, Depth Protocol, Fact and estimate labels, Rust & Salt, Score my launch weeks action, Six-card comparison grid (+3 more)

### Community 33 - "revenue.ts"
Cohesion: 0.27
Nodes (8): knownNonNegative(), RevenueObservation, roundSig(), scoreRevenue(), weightedPercentile(), EstimatedRevenue, competitor(), game()

### Community 34 - "ReleaseSignal design system"
Cohesion: 0.20
Nodes (10): Dark intelligence console, Illustrative analysis, Inter body typography, JetBrains Mono evidence typography, Persisted four-state journey, Reduced motion, ReleaseSignal design system, Sora headings (+2 more)

### Community 35 - "Application page dependency tree"
Cohesion: 0.20
Nodes (10): AnalyticsPhase, Application page dependency tree, ComparablesPhase, CompetitorDrawer, CompetitorGrid, DescribePhase, ProvenanceTag, Session snapshots (+2 more)

### Community 36 - "WelcomePhase.tsx"
Cohesion: 0.29
Nodes (8): CHART_POINTS, InvestorPreview(), MiniMetric(), audiences, ImportModal(), outcomes, Props, WelcomePhase()

### Community 37 - "Comparable games screen"
Cohesion: 0.20
Nodes (8): Abyssal Echoes, Comparable games screen, Depth Protocol, Rust & Salt, Score my launch weeks, Space Foodtruck, Submerged Panic, Void Diver 4

### Community 38 - "Live collector"
Cohesion: 0.20
Nodes (9): Gamalytic estimates, Grok ranking, Grok validation, IGDB MCP search, IGDB metadata, Live collector, Steam, Steam identity resolution (+1 more)

### Community 39 - "Architecture-aligned testing"
Cohesion: 0.20
Nodes (10): API contracts, Application orchestration, Architecture-aligned testing, Architecture boundaries, Browser persistence, CI verification, Domain scoring invariants, Provider normalization (+2 more)

### Community 40 - "ScoredCompetitor"
Cohesion: 0.31
Nodes (8): compactCurrency(), ComparableRevenueChart(), Props, shortName(), Props, DiscoverResult, ScoredCompetitor, recharts

### Community 41 - "react"
Cohesion: 0.22
Nodes (3): SearchResult, ACCEPTED, react

### Community 42 - "ReleaseSignal architecture"
Cohesion: 0.31
Nodes (9): Application use cases, Approval-gated collection, Architecture boundary tests, Browser analysis snapshots, Domain contracts and scoring, HTTP route adapters, Infrastructure provider adapters, ReleaseSignal architecture (+1 more)

### Community 43 - "Investor demo flow"
Cohesion: 0.22
Nodes (9): Collected game facts, Comparable approval, Concept validation, Immutable JSON snapshot, Investor demo flow, KEEP MOVE MITIGATE verdict, Print-to-PDF report, Revenue evidence (+1 more)

### Community 44 - "Two-stage live game discovery"
Cohesion: 0.31
Nodes (5): Explicit candidate approval, Two-stage live game discovery, Grok extraction and ranking, Backend-owned IGDB MCP search, Description validation

### Community 45 - "CI verification"
Cohesion: 0.25
Nodes (8): CI verification, Frozen lockfile installation, Lint, Node.js 20, pnpm 10.16.0, Production build, Typecheck, Vitest tests

### Community 46 - "ReleaseSignal theme"
Cohesion: 0.25
Nodes (8): Dark surface hierarchy, Inter, JetBrains Mono, Primary blue signal, ReleaseSignal theme, Responsive layout, Semantic green amber red, Sora

### Community 47 - "Launch calendar prototype"
Cohesion: 0.25
Nodes (8): Expandable collision rationale, KEEP recommendation, Launch calendar prototype, MITIGATE recommendation, MOVE recommendation, Optimal release window, Planned launch week, Weekly overlap score

### Community 48 - "ReleaseSignal welcome screen"
Cohesion: 0.25
Nodes (7): Comparable performance, Describe your game, Find true comparables, Import Steam URL, ReleaseSignal welcome screen, Score launch week, Start from scratch

### Community 49 - "ReleaseSignal candidate weeks screen"
Cohesion: 0.25
Nodes (8): Expanded week explanation, ReleaseSignal candidate weeks screen, Oct 26–Nov 1 optimal window, overlap 29, Planned week selector and horizon toggle, FACT Steam and PREDICTION engine labels, Save to dashboard action, KEEP MITIGATE MOVE verdict badges, Weekly launch collision cards

### Community 50 - "ReleaseSignal candidate weeks screen"
Cohesion: 0.25
Nodes (8): Expanded week explanation, ReleaseSignal candidate weeks screen, Oct 26–Nov 1 optimal window, overlap 29, Planned week selector and horizon toggle, FACT Steam and PREDICTION engine labels, Save to dashboard action, KEEP MITIGATE MOVE verdict badges, Weekly launch collision cards

### Community 51 - "ReleaseSignal welcome screen"
Cohesion: 0.25
Nodes (7): Comparable performance, Describe your game, Find true comparables, Import Steam URL, ReleaseSignal welcome screen, Score launch week, Start from scratch

### Community 52 - "Live game data collector"
Cohesion: 0.36
Nodes (5): similar-games-data-collector, Live game data collector, Gamalytic estimates, IGDB MCP enrichment, Steam store and reviews

### Community 53 - "Provider ownership"
Cohesion: 0.25
Nodes (8): Gamalytic commercial estimates, IGDB MCP discovery, Missing evidence remains unavailable, Provider ownership, Sourced metadata, Steam facts, Typed provider failures, xAI concept validation

### Community 54 - "launch-inputs.ts"
Cohesion: 0.50
Nodes (6): analysisHorizonWeeks(), dateInputValue(), dateOnly(), launchDateError(), months, today

### Community 55 - "Shared UI components"
Cohesion: 0.29
Nodes (7): DegradedBanner, DriverList, LoadingSkeleton, ProvenanceTag, ScoreBar, Shared UI components, StaleSnapshotBanner

### Community 56 - "App Router route map"
Cohesion: 0.29
Nodes (7): App Router route map, GET /api/health, POST /api/analyze, POST /api/export/json, POST /api/games/discover, POST /api/games/discover/collect, Single persisted page route

### Community 57 - "json/route.ts"
Cohesion: 0.33
Nodes (4): PayloadSchema, POST(), SnapshotSchema, snapshot

### Community 58 - "Comparable review prototype"
Cohesion: 0.29
Nodes (7): Cohort median summary, Comparable review prototype, Estimated revenue and copies, Gameplay description matching, Score my launch weeks, Six-card comparable cohort, Steam review and price facts

### Community 59 - "Welcome prototype"
Cohesion: 0.29
Nodes (7): Commercial evidence, Gameplay comparables, Launch-week scoring, Start from scratch, Steam import modal, Steam URL import, Welcome prototype

### Community 60 - "Filled description screen"
Cohesion: 0.29
Nodes (7): Dark console with pale input cards, Filled description screen, Find comparables action, Four-player submarine co-op description, Genre taxonomy search, Locked comparables stage, Optional comparable references

### Community 61 - "Description screen"
Cohesion: 0.29
Nodes (6): Description screen, Find comparables, Gameplay description, Genres selector, The Outlast Trials, Three-step progress indicator

### Community 62 - "Live collector"
Cohesion: 0.29
Nodes (6): Approved Steam AppIDs, Gamalytic batch, IGDB metadata, Live collector, Steam identity boundary, Stored match evidence

### Community 63 - "Demo runbook"
Cohesion: 0.29
Nodes (4): DEMO_CAPTURE fixture recording, Demo runbook, L0–L3 demo failure ladder, Three rehearsed demo scripts

### Community 64 - "Project contribution rules"
Cohesion: 0.33
Nodes (6): Conventional commits, Project contribution rules, Pure scoring functions, Sourced provenance, Strict TypeScript, Thin validated routes

### Community 65 - "Description prototype"
Cohesion: 0.33
Nodes (6): Description prototype, Find comparables, Four-player submarine co-op concept, Genre taxonomy suggestions, Optional similar-game references, Three-stage progress navigation

### Community 66 - "ReleaseSignal description screen"
Cohesion: 0.33
Nodes (6): ReleaseSignal description screen, Disabled Find comparables action, Moment-to-moment gameplay textarea, Steam taxonomy suggestion chips, Optional similar-game references, Describe Comparables Launch window stepper

### Community 67 - "Concept extraction"
Cohesion: 0.33
Nodes (3): Clarifying questions, Concept extraction, Document import

### Community 68 - "Field provenance"
Cohesion: 0.33
Nodes (4): Boxleiter estimator, Gamalytic, IGDB, Steam

### Community 69 - "Immutable corpus"
Cohesion: 0.33
Nodes (3): AI fallback, Immutable corpus, Pure scoring

### Community 70 - "Preview request"
Cohesion: 0.33
Nodes (5): Grok validation, IGDB semantic search, Live provider collection, Preview request, Steam identity resolution

### Community 71 - "IGDB MCP endpoint"
Cohesion: 0.33
Nodes (5): IGDB MCP endpoint, IGDB OAuth scope, Sanitized provider failures, semantic_search_games, Shared rate gate

### Community 72 - "Pending preview Map"
Cohesion: 0.47
Nodes (5): collecting, consumed, Pending preview Map, Preview expiry, ready

### Community 73 - "similar-games-data-collector"
Cohesion: 0.33
Nodes (5): Approval preview, Gamalytic estimates, Grok interpretation, IGDB candidates, Steam facts

### Community 74 - "igdb-client.ts"
Cohesion: 0.60
Nodes (5): getToken(), igdbGames(), igdbMultiquery(), igdbQuery(), rateLimit()

### Community 75 - "Root application shell"
Cohesion: 0.40
Nodes (5): Google Fonts, ReleaseSignal product header, Root application shell, RootLayout, Scrollable content area

### Community 76 - "Hackathon code of conduct"
Cohesion: 0.40
Nodes (5): Azerbaijan developer community, Constructive feedback, Fair attribution, GDG coordinators, Hackathon code of conduct

### Community 77 - "Atomic preview claim"
Cohesion: 0.40
Nodes (3): Approve all, Atomic preview claim, Preview consumption

### Community 78 - "Grok description validation"
Cohesion: 0.40
Nodes (4): Clarification questions, Discovery facets, Grok description validation, INVALID_AI_OUTPUT

### Community 79 - "Discovery errors"
Cohesion: 0.40
Nodes (4): AI errors, Discovery errors, Preview lifecycle errors, Provider errors

### Community 80 - "Free Steam-game list"
Cohesion: 0.40
Nodes (4): AppID isolation, Estimated copies sold, Estimated gross USD revenue, Free Steam-game list

### Community 81 - "Deterministic verification"
Cohesion: 0.40
Nodes (4): API health, Collector smoke check, Deterministic verification, Process-local preview

### Community 82 - "Discovery preview"
Cohesion: 0.40
Nodes (4): Discovery preview, Needs clarification, No matches, No-store responses

### Community 83 - "Collection sources"
Cohesion: 0.40
Nodes (3): Collection issues, Collection sources, Sourced<T>

### Community 84 - "Provider request gates"
Cohesion: 0.40
Nodes (3): Bounded retries, IGDB OAuth refresh, Partial failures

### Community 85 - "Backend reference"
Cohesion: 0.40
Nodes (5): Approval workflow, Backend reference, Discovery sequence, Provider resilience, Service boundaries

### Community 86 - "Steam field mapping"
Cohesion: 0.40
Nodes (3): Steam field mapping, Global review totals, Steam authoritative store facts

### Community 87 - "Exact Steam identity resolution"
Cohesion: 0.60
Nodes (4): Exact Steam identity resolution, IGDB external_game identity mapping, invalid_data identity mismatch, Unique unsigned Steam AppID

### Community 88 - "Discovery tag semantics"
Cohesion: 0.40
Nodes (3): Discovery facets, Discovery tag semantics, Verified Steam store tags

### Community 89 - "analyze-market.ts"
Cohesion: 0.40
Nodes (4): AnalysisProviders, AnalyzeMarketInput, providers, UpcomingCollection

### Community 90 - "steam-client.ts"
Cohesion: 0.60
Nodes (3): getAppDetails(), getAppReviews(), storeRateLimit()

### Community 92 - "Next.js agent rules"
Cohesion: 0.50
Nodes (4): Breaking API changes, Generated agent files, Local Next.js documentation, Next.js agent rules

### Community 93 - "TaxonomyEditor.tsx"
Cohesion: 0.83
Nodes (3): AddTag(), TagChip(), TaxonomyEditor()

### Community 94 - "ReleaseSignal vector logo"
Cohesion: 0.50
Nodes (4): Blue signal accent, Circular radar emblem, ReleaseSignal vector logo, ReleaseSignal wordmark

### Community 95 - "ReleaseSignal raster logo"
Cohesion: 0.50
Nodes (4): Circular radar emblem, ReleaseSignal raster logo, ReleaseSignal wordmark, White and blue brand typography

### Community 96 - "Live interactive flow"
Cohesion: 0.50
Nodes (3): Live interactive flow, POST /api/games/discover, POST /api/games/discover/collect

### Community 98 - "Fresh validation"
Cohesion: 0.50
Nodes (3): Clarification answers, Fresh validation, IGDB search

### Community 99 - "ReleaseSignal logo"
Cohesion: 0.50
Nodes (4): Blue glow palette, Radar signal emblem, ReleaseSignal logo, ReleaseSignal wordmark

### Community 100 - "Window icon"
Cohesion: 0.50
Nodes (4): Browser frame, Gray fill, Three header dots, Window icon

### Community 101 - "API response envelope"
Cohesion: 0.67
Nodes (3): API response envelope, Legacy corpus routes, Snapshot export

### Community 102 - "Structured-output schemas"
Cohesion: 0.67
Nodes (3): Ranking membership checks, Structured-output schemas, Untrusted text

### Community 104 - "pnpm workspace build approvals"
Cohesion: 0.67
Nodes (3): pnpm workspace build approvals, esbuild approved build, unrs-resolver approved build

### Community 105 - "Globe vector icon"
Cohesion: 0.67
Nodes (3): Globe vector icon, Latitude and longitude grid, Neutral gray icon

## Knowledge Gaps
- **527 isolated node(s):** `DiscoveryStage`, `ApiEnvelope`, `ApprovalResult`, `ApprovedGame`, `DiscoveryPreviewResult` (+522 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 647 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `vitest` to `schemas.ts`, `zod`, `fetch-igdb-mcp.ts`, `page.tsx`, `collector/types.ts`, `mcp/client.ts`, `normalize-game.ts`, `NormalizedGame`, `package.json`, `domain/types.ts`, `scoring/index.ts`, `MarketReport`, `ProviderError`, `release-risk.ts`, `reviews.ts`, `store.ts`, `revenue.ts`, `launch-inputs.ts`, `json/route.ts`, `mcp/client.test.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `DiscoveryStage`, `ApiEnvelope`, `ApprovalResult` to the rest of the system?**
  _527 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schemas.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.055501460564751706 - nodes in this community are weakly interconnected._
- **Why does `next` connect `zod` to `package.json`, `page.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `zod` be split into smaller, more focused modules?**
  _Cohesion score 0.0647307924984876 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `zod` to `schemas.ts`, `collector/types.ts`, `mcp/client.ts`, `normalize-game.ts`, `package.json`, `vitest`, `ProviderError`, `upcoming-releases.ts`, `json/route.ts`, `reviews.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Should `fetch-igdb-mcp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06285714285714286 - nodes in this community are weakly interconnected._
## Update Notes

Code was rebuilt with `graphify update .`; `docs/SCORING.md` was re-extracted semantically. Community names use graphify hub labels. The undirected graph can collapse multiple relationships between the same endpoints; the prior raw extraction audit remains a limitation.

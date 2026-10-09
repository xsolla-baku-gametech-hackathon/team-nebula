# Graph Report - Ludiqentra  (2026-10-09)

## Corpus Check
- 230 files · ~150,497 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .example 1, (none) 1, .ico 1)

## Summary
- 1239 nodes · 2111 edges · 127 communities (110 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.87)
- Token cost: unavailable for host-agent semantic extraction; no external LLM API was called. Zero placeholders in raw extraction are not measured usage.

## Community Hubs (Navigation)
- Analysis Interface Components
- Browser Session Orchestration
- Snapshots and Frontend Contracts
- Live Game Collection
- Provider Authentication Infrastructure
- Corpus Testing Conventions
- Preview Approval Tests
- Provider HTTP Resilience
- IGDB Corpus Fetching
- Package and Lint Configuration
- TypeScript Compiler Configuration
- Steam Catalog Scripts
- Upcoming Release Collection
- Saturation and Sales Estimates
- Steam Game Normalization
- Runtime Package Dependencies
- Project Task Commands
- Comparable Evidence Components
- Development Package Dependencies
- Corpus Discovery Search
- Approved Candidate Collection
- Concept Taxonomy Extraction
- Discovery Input Validation
- Weekly Release Risk
- API Response Adapters
- Score Display Components
- Market Reception Analysis
- Candidate Selection Validation
- Competitor Similarity Scoring
- Concept Clarification Flow
- HTTP API Contracts
- Revenue Range Scoring
- Steam Review Collection
- ReleaseSignal Product Overview
- Reusable UI Component Catalog
- Discovery Preview API
- Degraded Response Metadata
- Comparable Screenshot Evidence
- Grok Discovery Integration
- ReleaseSignal Design System
- Product Page Dependency Tree
- Market Analysis API
- Comparable Review Screenshot
- Backend Discovery Architecture
- Deterministic Scoring Principles
- Scoring Model Documentation
- Architecture Testing Strategy
- Application Layer Boundaries
- Investor Demo Journey
- Approval Gated Discovery
- Continuous Integration Checks
- Product Typography Theme
- Launch Calendar Prototype
- Welcome Review Screenshot
- Launch Window Review Screenshot
- Launch Window Screenshot
- Welcome Product Screenshot
- Live Collector Documentation
- Provider Data Ownership
- Shared UI Catalog
- App Router Route Map
- Snapshot JSON Export
- Root Layout Fonts
- Comparable Review Prototype
- Welcome Page Prototype
- Filled Description Screenshot
- Description Product Screenshot
- Approved Collection Pipeline
- Demo Rehearsal Runbook
- Project Contribution Rules
- Game Description Prototype
- Description Review Screenshot
- Concept AI Integration
- Data Field Provenance
- Corpus Runtime Architecture
- Discovery Request Sequence
- IGDB Semantic Search
- Preview State Lifecycle
- Provider Service Boundaries
- IGDB Metadata Client
- Provider Smoke Scripts
- Architecture Boundary Tests
- IGDB Query Scripts
- Root Application Shell
- Community Code Conduct
- Atomic Preview Approval
- Description Readiness Validation
- Discovery Error Catalog
- Gamalytic Revenue Estimates
- Backend Operations Runbook
- Discovery Preview Contracts
- Collection Evidence Provenance
- Provider Retry Gates
- Backend Reference Navigation
- Steam Field Mapping
- Steam Identity Resolution
- Discovery Tag Constraints
- Steam API Scripts
- MCP Client Tests
- Next.js Agent Rules
- Taxonomy Editor Controls
- Prototype Vector Branding
- Raster Product Branding
- Live Backend API
- Candidate Ranking Checks
- Clarification Retry Flow
- Product Vector Branding
- Browser Window Icon
- Legacy API Export Contracts
- Structured AI Output Safety
- Concept Extraction Prompt
- Workspace Build Approvals
- Globe Vector Icon
- Document Import Prompt
- Concept Patch Prompt
- PostCSS Configuration
- Vercel Vector Branding
- Review Sentiment Concept
- Document Vector Icon
- Next.js Wordmark Asset

## God Nodes (most connected - your core abstractions)
1. `vitest` - 37 edges
2. `GameConcept` - 28 edges
3. `ProviderError` - 22 edges
4. `parseProvider()` - 21 edges
5. `ScoredCompetitor` - 20 edges
6. `Home()` - 19 edges
7. `requestText()` - 19 edges
8. `server-only` - 19 edges
9. `zod` - 19 edges
10. `DiscoveryError` - 17 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `fail()`  [EXTRACTED]
  app/api/analyze/route.ts → lib/api/envelope.ts
- `POST()` --calls--> `ok()`  [EXTRACTED]
  app/api/analyze/route.ts → lib/api/envelope.ts
- `POST()` --calls--> `analyzeConcept()`  [EXTRACTED]
  app/api/concept/analyze/route.ts → lib/application/concept/analyze-concept.ts
- `POST()` --calls--> `analyzeConcept()`  [EXTRACTED]
  app/api/concept/import/route.ts → lib/application/concept/analyze-concept.ts
- `POST()` --calls--> `fail()`  [EXTRACTED]
  app/api/discover/route.ts → lib/api/envelope.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Approval-gated discovery and collection flow** — docs_backend_reference_architecture_grok_validation, docs_backend_reference_architecture_igdb_mcp_search, docs_backend_reference_architecture_grok_ranking, docs_backend_reference_architecture_steam_identity_resolution, docs_backend_reference_architecture_pending_preview, docs_backend_reference_architecture_user_approval, docs_backend_reference_architecture_live_collector [EXTRACTED 1.00]
- **Typed analysis snapshot** — docs_data_model_gameconcept, docs_data_model_scoredcompetitor, docs_data_model_marketreport, docs_data_model_snapshot [EXTRACTED 1.00]
- **Approval gated discovery** — docs_discovery_validation, docs_discovery_preview, docs_discovery_approval, docs_discovery_collection [EXTRACTED 1.00]
- **Weekly decision explanation 8** — data_stitch_review_04_launch_window_weekly_cards, data_stitch_review_04_launch_window_expanded_week, data_stitch_review_04_launch_window_verdict_badges, data_stitch_review_04_launch_window_provenance [EXTRACTED 1.00]
- **Weekly decision explanation 11** — data_stitch_screenshots_launch_window_weekly_cards, data_stitch_screenshots_launch_window_expanded_week, data_stitch_screenshots_launch_window_verdict_badges, data_stitch_screenshots_launch_window_provenance [EXTRACTED 1.00]

## Communities (127 total, 17 thin omitted)

### Community 0 - "Analysis Interface Components"
Cohesion: 0.05
Nodes (58): AnalyticsPhase(), Donut(), EvidenceMetric(), fmt(), Props, sentimentLabel(), verdictTone(), compactCurrency() (+50 more)

### Community 1 - "Browser Session Orchestration"
Cohesion: 0.05
Nodes (57): AnalyticsPhase, buildQuery(), ComparablesPhase, DiscoveryStage, errorMessage(), fallbackConcept(), Home(), PhaseLoader() (+49 more)

### Community 2 - "Snapshots and Frontend Contracts"
Cohesion: 0.08
Nodes (16): Data model, Driver, GameConcept, MarketReport, NormalizedGame, ReleaseWindow, ScoredCompetitor, Sourced<T> (+8 more)

### Community 3 - "Live Game Collection"
Cohesion: 0.12
Nodes (20): headers, maxDuration, POST(), runtime, collectGames(), unpack(), CollectorProviders, providers (+12 more)

### Community 4 - "Provider Authentication Infrastructure"
Cohesion: 0.17
Nodes (19): parseJson(), parseProvider(), providerGate(), ProviderError, fetchIgdb(), findPreviewCandidates(), parseCandidates(), SearchResult (+11 more)

### Community 5 - "Corpus Testing Conventions"
Cohesion: 0.09
Nodes (12): Continuous integration checks, Contributing conventions, Driver contributions, ProvenanceTag, Corpus build pipeline, Offline Python pipeline, Upcoming releases with date precision, Light API envelope tests (+4 more)

### Community 6 - "Preview Approval Tests"
Cohesion: 0.13
Nodes (13): PreviewProviders, PreviewRecord, previewStore, DescriptionValidation, PreviewCandidate, candidates, game(), setup() (+5 more)

### Community 7 - "Provider HTTP Resilience"
Cohesion: 0.17
Nodes (12): RequestGate, requestText(), sleep(), SPACING, appId, estimate, fetchGamalytic(), GamalyticBatch (+4 more)

### Community 8 - "IGDB Corpus Fetching"
Cohesion: 0.18
Nodes (19): @modelcontextprotocol/sdk, buildLookup(), DATA_DIR, fetchGames(), IgdbGame, LookupMap, main(), normalizeGame() (+11 more)

### Community 9 - "Package and Lint Configuration"
Cohesion: 0.11
Nodes (18): eslintConfig, name, packageManager, private, version, eslint, eslint-config-next, nanoid (+10 more)

### Community 10 - "TypeScript Compiler Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "Steam Catalog Scripts"
Cohesion: 0.18
Nodes (13): playwright, AppDetails, DATA_DIR, fetchAppDetails(), fetchCatalog(), fetchReviews(), main(), normalizeApp() (+5 more)

### Community 12 - "Upcoming Release Collection"
Cohesion: 0.21
Nodes (14): buildQuery(), DateWindow, fetchUpcomingReleases(), isoDate(), monthNumbers, plusDays(), popularityThreat(), ReleaseDateRow (+6 more)

### Community 13 - "Saturation and Sales Estimates"
Cohesion: 0.23
Nodes (10): estimateCopies(), estimateRevenue(), multiplierForPrice(), MULTIPLIERS, sumDrivers(), band(), clamp(), scoreSaturation() (+2 more)

### Community 14 - "Steam Game Normalization"
Cohesion: 0.23
Nodes (12): Source, modes, normalizeGame(), perspectives, sourced(), GamalyticGame, money, plainText() (+4 more)

### Community 15 - "Runtime Package Dependencies"
Cohesion: 0.12
Nodes (16): dependencies, ai, @ai-sdk/xai, cheerio, clsx, lucide-react, @modelcontextprotocol/sdk, nanoid (+8 more)

### Community 16 - "Project Task Commands"
Cohesion: 0.12
Nodes (16): scripts, build, collector:smoke, corpus:embed, corpus:fetch, corpus:fetch:steam, corpus:verify, dev (+8 more)

### Community 17 - "Comparable Evidence Components"
Cohesion: 0.23
Nodes (10): CompetitorCard(), formatCount(), formatRevenue(), CompetitorDrawer(), CompetitorGrid(), LABELS, SimilarityBadge(), ProvenanceTag() (+2 more)

### Community 18 - "Development Package Dependencies"
Cohesion: 0.13
Nodes (15): devDependencies, dotenv, eslint, eslint-config-next, @phalcode/ts-igdb-client, playwright, tailwindcss, @tailwindcss/postcss (+7 more)

### Community 19 - "Corpus Discovery Search"
Cohesion: 0.29
Nodes (9): POST(), Schema, CorpusMeta, Corpus, getCorpus(), cosine(), fuzzySearch(), searchCorpus() (+1 more)

### Community 20 - "Approved Candidate Collection"
Cohesion: 0.21
Nodes (10): headers, maxDuration, POST(), runtime, ApprovalProviders, approvePreview(), defaults, ApprovalInput (+2 more)

### Community 21 - "Concept Taxonomy Extraction"
Cohesion: 0.19
Nodes (10): GENRE_KEYWORDS, MECHANIC_KEYWORDS, MODE_MAP, PERSPECTIVE_MAP, GameMode, Perspective, Platform, buf (+2 more)

### Community 22 - "Discovery Input Validation"
Cohesion: 0.19
Nodes (9): buildSearchQueries(), ApprovalInputValue, DescriptionValidationSchema, DiscoverInput, DiscoveryTag, DiscoveryTagSchema, PreviewCandidateSchema, previewId (+1 more)

### Community 23 - "Weekly Release Risk"
Cohesion: 0.21
Nodes (10): clamp(), DATE_CONFIDENCE_WEIGHT, iso(), riskBand(), scoreReleaseRisk(), weekStart(), ReleaseWindowRisk, RiskBand (+2 more)

### Community 24 - "API Response Adapters"
Cohesion: 0.28
Nodes (7): POST(), Schema, POST(), fail(), ok(), nextConfig, next

### Community 25 - "Score Display Components"
Cohesion: 0.26
Nodes (8): SaturationPanel(), DriverList(), LoadingSkeleton(), BAND_COLORS, ScoreBar(), cn(), clsx, tailwind-merge

### Community 26 - "Market Reception Analysis"
Cohesion: 0.19
Nodes (8): AnalysisProviders, AnalyzeMarketInput, providers, UpcomingCollection, scoreReception(), ConfidenceBand, EstimatedPlayerReception, NormalizedGame

### Community 27 - "Candidate Selection Validation"
Cohesion: 0.24
Nodes (8): validatePreviewRanking(), validateRanking(), Candidate, DiscoveryError, RankingSchema, candidates, intent, validation

### Community 28 - "Competitor Similarity Scoring"
Cohesion: 0.26
Nodes (8): scoreCompetitor(), ComponentEntry, genreScore(), jaccard(), priceComponent(), scoreSimilarity(), validPrice(), conceptHorrorCoop

### Community 29 - "Concept Clarification Flow"
Cohesion: 0.27
Nodes (8): analyzeConcept(), fallbackExtract(), ConceptField, grokExtract(), buildUserPrompt(), fallbackQuestions(), generateQuestions(), GrokQuestion

### Community 30 - "HTTP API Contracts"
Cohesion: 0.17
Nodes (12): Candidate approval, Clarifying questions, Description validation, GET /api/health, HTTP API, JSON response envelope, Live normalized records, POST /api/analyze (+4 more)

### Community 31 - "Revenue Range Scoring"
Cohesion: 0.26
Nodes (9): driver(), knownNonNegative(), RevenueObservation, roundSig(), scoreRevenue(), weightedPercentile(), EstimatedRevenue, competitor() (+1 more)

### Community 32 - "Steam Review Collection"
Cohesion: 0.23
Nodes (9): ReviewComment, CommentSchema, count, fetchSteamComments(), fetchSteamReviews(), parseReviewComments(), parseReviewSummary(), ReviewSummary (+1 more)

### Community 33 - "ReleaseSignal Product Overview"
Cohesion: 0.17
Nodes (12): 26–52 week calendar, Approval-gated collection, Browser localStorage, Gamalytic estimates, Gameplay-based comparables, Grok description validation, IGDB MCP discovery, Immutable exports (+4 more)

### Community 34 - "Reusable UI Component Catalog"
Cohesion: 0.18
Nodes (11): CompetitorCard, DriverList, Extractable components, LoadingSkeleton, ProvenanceTag, ReleaseCalendar, RevenueRange, RootProductHeader (+3 more)

### Community 35 - "Discovery Preview API"
Cohesion: 0.27
Nodes (7): headers, maxDuration, POST(), runtime, discoveryErrorResponse(), statuses, previewGames()

### Community 36 - "Degraded Response Metadata"
Cohesion: 0.20
Nodes (8): MESSAGES, ApiError, ApiResponse, DegradedFlag, ErrorCode, GameReviewComment, ResponseMeta, TimePoint

### Community 37 - "Comparable Screenshot Evidence"
Cohesion: 0.18
Nodes (11): Abyssal Echoes, Cohort median strip, Comparable review screenshot, Depth Protocol, Fact and estimate labels, Rust & Salt, Score my launch weeks action, Six-card comparison grid (+3 more)

### Community 38 - "Grok Discovery Integration"
Cohesion: 0.33
Nodes (8): defaults, grokModelId(), rankPreviewCandidates(), structured(), validateDescription(), ai, @ai-sdk/xai, validation

### Community 39 - "ReleaseSignal Design System"
Cohesion: 0.20
Nodes (10): Dark intelligence console, Illustrative analysis, Inter body typography, JetBrains Mono evidence typography, Persisted four-state journey, Reduced motion, ReleaseSignal design system, Sora headings (+2 more)

### Community 40 - "Product Page Dependency Tree"
Cohesion: 0.20
Nodes (10): AnalyticsPhase, Application page dependency tree, ComparablesPhase, CompetitorDrawer, CompetitorGrid, DescribePhase, ProvenanceTag, Session snapshots (+2 more)

### Community 41 - "Market Analysis API"
Cohesion: 0.24
Nodes (7): maxDuration, POST(), runtime, Schema, analyzeMarket(), liveCompetitor, liveGame

### Community 42 - "Comparable Review Screenshot"
Cohesion: 0.20
Nodes (8): Abyssal Echoes, Comparable games screen, Depth Protocol, Rust & Salt, Score my launch weeks, Space Foodtruck, Submerged Panic, Void Diver 4

### Community 43 - "Backend Discovery Architecture"
Cohesion: 0.20
Nodes (9): Gamalytic estimates, Grok ranking, Grok validation, IGDB MCP search, IGDB metadata, Live collector, Steam, Steam identity resolution (+1 more)

### Community 44 - "Deterministic Scoring Principles"
Cohesion: 0.24
Nodes (10): Deterministic scoring, Explanatory drivers, Reception ratio, Release risk, Revenue ranges, Saturation, Similarity, Similarity-weighted percentiles (+2 more)

### Community 45 - "Scoring Model Documentation"
Cohesion: 0.24
Nodes (5): Scoring models, Explainable score drivers, Market saturation model, Weighted similarity model, KEEP MOVE MITIGATE verdict

### Community 46 - "Architecture Testing Strategy"
Cohesion: 0.20
Nodes (10): API contracts, Application orchestration, Architecture-aligned testing, Architecture boundaries, Browser persistence, CI verification, Domain scoring invariants, Provider normalization (+2 more)

### Community 47 - "Application Layer Boundaries"
Cohesion: 0.31
Nodes (9): Application use cases, Approval-gated collection, Architecture boundary tests, Browser analysis snapshots, Domain contracts and scoring, HTTP route adapters, Infrastructure provider adapters, ReleaseSignal architecture (+1 more)

### Community 48 - "Investor Demo Journey"
Cohesion: 0.22
Nodes (9): Collected game facts, Comparable approval, Concept validation, Immutable JSON snapshot, Investor demo flow, KEEP MOVE MITIGATE verdict, Print-to-PDF report, Revenue evidence (+1 more)

### Community 49 - "Approval Gated Discovery"
Cohesion: 0.31
Nodes (5): Explicit candidate approval, Two-stage live game discovery, Grok extraction and ranking, Backend-owned IGDB MCP search, Description validation

### Community 50 - "Continuous Integration Checks"
Cohesion: 0.25
Nodes (8): CI verification, Frozen lockfile installation, Lint, Node.js 20, pnpm 10.16.0, Production build, Typecheck, Vitest tests

### Community 51 - "Product Typography Theme"
Cohesion: 0.25
Nodes (8): Dark surface hierarchy, Inter, JetBrains Mono, Primary blue signal, ReleaseSignal theme, Responsive layout, Semantic green amber red, Sora

### Community 52 - "Launch Calendar Prototype"
Cohesion: 0.25
Nodes (8): Expandable collision rationale, KEEP recommendation, Launch calendar prototype, MITIGATE recommendation, MOVE recommendation, Optimal release window, Planned launch week, Weekly overlap score

### Community 53 - "Welcome Review Screenshot"
Cohesion: 0.25
Nodes (7): Comparable performance, Describe your game, Find true comparables, Import Steam URL, ReleaseSignal welcome screen, Score launch week, Start from scratch

### Community 54 - "Launch Window Review Screenshot"
Cohesion: 0.25
Nodes (8): Expanded week explanation, ReleaseSignal candidate weeks screen, Oct 26–Nov 1 optimal window, overlap 29, Planned week selector and horizon toggle, FACT Steam and PREDICTION engine labels, Save to dashboard action, KEEP MITIGATE MOVE verdict badges, Weekly launch collision cards

### Community 55 - "Launch Window Screenshot"
Cohesion: 0.25
Nodes (8): Expanded week explanation, ReleaseSignal candidate weeks screen, Oct 26–Nov 1 optimal window, overlap 29, Planned week selector and horizon toggle, FACT Steam and PREDICTION engine labels, Save to dashboard action, KEEP MITIGATE MOVE verdict badges, Weekly launch collision cards

### Community 56 - "Welcome Product Screenshot"
Cohesion: 0.25
Nodes (7): Comparable performance, Describe your game, Find true comparables, Import Steam URL, ReleaseSignal welcome screen, Score launch week, Start from scratch

### Community 57 - "Live Collector Documentation"
Cohesion: 0.36
Nodes (5): similar-games-data-collector, Live game data collector, Gamalytic estimates, IGDB MCP enrichment, Steam store and reviews

### Community 58 - "Provider Data Ownership"
Cohesion: 0.25
Nodes (8): Gamalytic commercial estimates, IGDB MCP discovery, Missing evidence remains unavailable, Provider ownership, Sourced metadata, Steam facts, Typed provider failures, xAI concept validation

### Community 59 - "Shared UI Catalog"
Cohesion: 0.29
Nodes (7): DegradedBanner, DriverList, LoadingSkeleton, ProvenanceTag, ScoreBar, Shared UI components, StaleSnapshotBanner

### Community 60 - "App Router Route Map"
Cohesion: 0.29
Nodes (7): App Router route map, GET /api/health, POST /api/analyze, POST /api/export/json, POST /api/games/discover, POST /api/games/discover/collect, Single persisted page route

### Community 61 - "Snapshot JSON Export"
Cohesion: 0.33
Nodes (4): PayloadSchema, POST(), SnapshotSchema, snapshot

### Community 62 - "Root Layout Fonts"
Cohesion: 0.29
Nodes (4): inter, jetbrainsMono, metadata, sora

### Community 63 - "Comparable Review Prototype"
Cohesion: 0.29
Nodes (7): Cohort median summary, Comparable review prototype, Estimated revenue and copies, Gameplay description matching, Score my launch weeks, Six-card comparable cohort, Steam review and price facts

### Community 64 - "Welcome Page Prototype"
Cohesion: 0.29
Nodes (7): Commercial evidence, Gameplay comparables, Launch-week scoring, Start from scratch, Steam import modal, Steam URL import, Welcome prototype

### Community 65 - "Filled Description Screenshot"
Cohesion: 0.29
Nodes (7): Dark console with pale input cards, Filled description screen, Find comparables action, Four-player submarine co-op description, Genre taxonomy search, Locked comparables stage, Optional comparable references

### Community 66 - "Description Product Screenshot"
Cohesion: 0.29
Nodes (6): Description screen, Find comparables, Gameplay description, Genres selector, The Outlast Trials, Three-step progress indicator

### Community 67 - "Approved Collection Pipeline"
Cohesion: 0.29
Nodes (6): Approved Steam AppIDs, Gamalytic batch, IGDB metadata, Live collector, Steam identity boundary, Stored match evidence

### Community 68 - "Demo Rehearsal Runbook"
Cohesion: 0.29
Nodes (4): DEMO_CAPTURE fixture recording, Demo runbook, L0–L3 demo failure ladder, Three rehearsed demo scripts

### Community 69 - "Project Contribution Rules"
Cohesion: 0.33
Nodes (6): Conventional commits, Project contribution rules, Pure scoring functions, Sourced provenance, Strict TypeScript, Thin validated routes

### Community 70 - "Game Description Prototype"
Cohesion: 0.33
Nodes (6): Description prototype, Find comparables, Four-player submarine co-op concept, Genre taxonomy suggestions, Optional similar-game references, Three-stage progress navigation

### Community 71 - "Description Review Screenshot"
Cohesion: 0.33
Nodes (6): ReleaseSignal description screen, Disabled Find comparables action, Moment-to-moment gameplay textarea, Steam taxonomy suggestion chips, Optional similar-game references, Describe Comparables Launch window stepper

### Community 72 - "Concept AI Integration"
Cohesion: 0.33
Nodes (3): Clarifying questions, Concept extraction, Document import

### Community 73 - "Data Field Provenance"
Cohesion: 0.33
Nodes (4): Boxleiter estimator, Gamalytic, IGDB, Steam

### Community 74 - "Corpus Runtime Architecture"
Cohesion: 0.33
Nodes (3): AI fallback, Immutable corpus, Pure scoring

### Community 75 - "Discovery Request Sequence"
Cohesion: 0.33
Nodes (5): Grok validation, IGDB semantic search, Live provider collection, Preview request, Steam identity resolution

### Community 76 - "IGDB Semantic Search"
Cohesion: 0.33
Nodes (5): IGDB MCP endpoint, IGDB OAuth scope, Sanitized provider failures, semantic_search_games, Shared rate gate

### Community 77 - "Preview State Lifecycle"
Cohesion: 0.47
Nodes (5): collecting, consumed, Pending preview Map, Preview expiry, ready

### Community 78 - "Provider Service Boundaries"
Cohesion: 0.33
Nodes (5): Approval preview, Gamalytic estimates, Grok interpretation, IGDB candidates, Steam facts

### Community 79 - "IGDB Metadata Client"
Cohesion: 0.33
Nodes (5): Game, id, IgdbBatch, IgdbMetadata, relations

### Community 80 - "Provider Smoke Scripts"
Cohesion: 0.40
Nodes (3): dotenv, main(), main()

### Community 81 - "Architecture Boundary Tests"
Cohesion: 0.33
Nodes (3): root, sourceExtensions, sourceFiles()

### Community 82 - "IGDB Query Scripts"
Cohesion: 0.60
Nodes (5): getToken(), igdbGames(), igdbMultiquery(), igdbQuery(), rateLimit()

### Community 83 - "Root Application Shell"
Cohesion: 0.40
Nodes (5): Google Fonts, ReleaseSignal product header, Root application shell, RootLayout, Scrollable content area

### Community 84 - "Community Code Conduct"
Cohesion: 0.40
Nodes (5): Azerbaijan developer community, Constructive feedback, Fair attribution, GDG coordinators, Hackathon code of conduct

### Community 85 - "Atomic Preview Approval"
Cohesion: 0.40
Nodes (3): Approve all, Atomic preview claim, Preview consumption

### Community 86 - "Description Readiness Validation"
Cohesion: 0.40
Nodes (4): Clarification questions, Discovery facets, Grok description validation, INVALID_AI_OUTPUT

### Community 87 - "Discovery Error Catalog"
Cohesion: 0.40
Nodes (4): AI errors, Discovery errors, Preview lifecycle errors, Provider errors

### Community 88 - "Gamalytic Revenue Estimates"
Cohesion: 0.40
Nodes (4): AppID isolation, Estimated copies sold, Estimated gross USD revenue, Free Steam-game list

### Community 89 - "Backend Operations Runbook"
Cohesion: 0.40
Nodes (4): API health, Collector smoke check, Deterministic verification, Process-local preview

### Community 90 - "Discovery Preview Contracts"
Cohesion: 0.40
Nodes (4): Discovery preview, Needs clarification, No matches, No-store responses

### Community 91 - "Collection Evidence Provenance"
Cohesion: 0.40
Nodes (3): Collection issues, Collection sources, Sourced<T>

### Community 92 - "Provider Retry Gates"
Cohesion: 0.40
Nodes (3): Bounded retries, IGDB OAuth refresh, Partial failures

### Community 93 - "Backend Reference Navigation"
Cohesion: 0.40
Nodes (5): Approval workflow, Backend reference, Discovery sequence, Provider resilience, Service boundaries

### Community 94 - "Steam Field Mapping"
Cohesion: 0.40
Nodes (3): Steam field mapping, Global review totals, Steam authoritative store facts

### Community 95 - "Steam Identity Resolution"
Cohesion: 0.60
Nodes (4): Exact Steam identity resolution, IGDB external_game identity mapping, invalid_data identity mismatch, Unique unsigned Steam AppID

### Community 96 - "Discovery Tag Constraints"
Cohesion: 0.40
Nodes (3): Discovery facets, Discovery tag semantics, Verified Steam store tags

### Community 97 - "Steam API Scripts"
Cohesion: 0.60
Nodes (3): getAppDetails(), getAppReviews(), storeRateLimit()

### Community 99 - "Next.js Agent Rules"
Cohesion: 0.50
Nodes (4): Breaking API changes, Generated agent files, Local Next.js documentation, Next.js agent rules

### Community 100 - "Taxonomy Editor Controls"
Cohesion: 0.83
Nodes (3): AddTag(), TagChip(), TaxonomyEditor()

### Community 101 - "Prototype Vector Branding"
Cohesion: 0.50
Nodes (4): Blue signal accent, Circular radar emblem, ReleaseSignal vector logo, ReleaseSignal wordmark

### Community 102 - "Raster Product Branding"
Cohesion: 0.50
Nodes (4): Circular radar emblem, ReleaseSignal raster logo, ReleaseSignal wordmark, White and blue brand typography

### Community 103 - "Live Backend API"
Cohesion: 0.50
Nodes (3): Live interactive flow, POST /api/games/discover, POST /api/games/discover/collect

### Community 105 - "Clarification Retry Flow"
Cohesion: 0.50
Nodes (3): Clarification answers, Fresh validation, IGDB search

### Community 106 - "Product Vector Branding"
Cohesion: 0.50
Nodes (4): Blue glow palette, Radar signal emblem, ReleaseSignal logo, ReleaseSignal wordmark

### Community 107 - "Browser Window Icon"
Cohesion: 0.50
Nodes (4): Browser frame, Gray fill, Three header dots, Window icon

### Community 110 - "Legacy API Export Contracts"
Cohesion: 0.67
Nodes (3): API response envelope, Legacy corpus routes, Snapshot export

### Community 111 - "Structured AI Output Safety"
Cohesion: 0.67
Nodes (3): Ranking membership checks, Structured-output schemas, Untrusted text

### Community 113 - "Workspace Build Approvals"
Cohesion: 0.67
Nodes (3): pnpm workspace build approvals, esbuild approved build, unrs-resolver approved build

### Community 114 - "Globe Vector Icon"
Cohesion: 0.67
Nodes (3): Globe vector icon, Latitude and longitude grid, Neutral gray icon

## Knowledge Gaps
- **527 isolated node(s):** `runtime`, `maxDuration`, `Schema`, `Schema`, `Schema` (+522 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 645 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `vitest` connect `Provider HTTP Resilience` to `Browser Session Orchestration`, `Live Game Collection`, `Provider Authentication Infrastructure`, `Preview Approval Tests`, `Package and Lint Configuration`, `Upcoming Release Collection`, `Saturation and Sales Estimates`, `Steam Game Normalization`, `Approved Candidate Collection`, `Discovery Input Validation`, `Weekly Release Risk`, `Market Reception Analysis`, `Candidate Selection Validation`, `Competitor Similarity Scoring`, `Revenue Range Scoring`, `Steam Review Collection`, `Discovery Preview API`, `Grok Discovery Integration`, `Market Analysis API`, `Snapshot JSON Export`, `Architecture Boundary Tests`, `MCP Client Tests`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **What connects `runtime`, `maxDuration`, `Schema` to the rest of the system?**
  _527 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Analysis Interface Components` be split into smaller, more focused modules?**
  _Cohesion score 0.050616050616050616 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `Provider Authentication Infrastructure` to `Steam Review Collection`, `Live Game Collection`, `Grok Discovery Integration`, `Provider HTTP Resilience`, `Market Analysis API`, `Package and Lint Configuration`, `Upcoming Release Collection`, `Steam Game Normalization`, `IGDB Metadata Client`, `Corpus Discovery Search`, `Discovery Input Validation`, `API Response Adapters`, `Snapshot JSON Export`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `Browser Session Orchestration` be split into smaller, more focused modules?**
  _Cohesion score 0.05441400304414003 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Analysis Interface Components` to `Browser Session Orchestration`, `Taxonomy Editor Controls`, `Comparable Evidence Components`, `Package and Lint Configuration`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Should `Snapshots and Frontend Contracts` be split into smaller, more focused modules?**
  _Cohesion score 0.07575757575757576 - nodes in this community are weakly interconnected._
## Extraction Notes

- Sensitive file skipped: `.npmrc`.
- AST extraction returned no symbols for 15 code files; structural coverage is limited for those files.
- Graph health: 1 dangling-endpoint edges; 2 self-loop edges; 72 collapsed undirected edges. See `graph-health.json`.

# Live game data collector

`similar-games-data-collector` prepares structured game facts for later display and analysis. The current entry point accepts selected Steam AppIDs. For automatic selection from natural language, use the [Grok discovery endpoint](discovery.md). Market analysis, sales-history charts, and frontend integration remain future work.

## Request

```http
POST /api/games/collect
Content-Type: application/json

{"steamAppIds":[739630,1966720]}
```

Accepts one to ten positive integer AppIDs; removes duplicates preserving order. Unknown input properties are rejected. Prices and availability use the US Steam store, with USD prices and English descriptions.

A successful response is `{ok:true,data:{games,failures},meta:{durationMs,mode:"live"}}`. Games extend `NormalizedGame` in `lib/types.ts` with regular price, date precision, comments, and collection provenance. See `lib/collector/types.ts` for the contract.

- `identity`: Steam AppID, optional exact IGDB ID, name, Steam URL.
- `metadata`: plain-text description, Steam genres/tags/modes/platforms/developers/publishers; IGDB themes/keywords/perspectives.
- `release`: Steam release date, raw date text, precision, released/early-access flags. Vague future dates remain null.
- `commercial`: current and regular USD prices; Gamalytic estimated copies and gross revenue, each carrying source and estimate labels. Missing estimates remain null; there is no price-times-copies fallback.
- `reviews`: global all-language/all-purchase totals, positive fraction (0–1), Steam rating label, and at most three recent English comments. Comments do not determine the totals and omit author identifiers. Unavailable comments become an empty array with an issue.
- `collection`: fetch timestamps, field sources, and typed provider issues. Fetch time is retrieval time, not the provider's data-update time.

Invalid JSON/input returns 400. Partial success returns 200 with per-game failures and optional-provider issues. If no Steam game can be loaded, the response is 502 with safe failure details. Unexpected internal failures return a sanitized 500. Every response has `Cache-Control: no-store`.

## Providers and configuration

Set `IGDB_MCP_CLIENT_ID` and `IGDB_MCP_CLIENT_SECRET` in root `.env.local`. These are MCP portal credentials, not Twitch REST credentials. Next.js does not load nested route-directory env files. Never commit secrets. Steam's public store endpoints and Gamalytic's free list endpoint do not require keys. `XAI_API_KEY` is used by the discovery endpoint for intent extraction and ranking; collecting explicit AppIDs does not call Grok.

The MCP SDK connects directly to `https://mcp.igdb.com/mcp`; no Python bridge or local MCP server is required. OAuth uses `https://mcp-auth.igdb.com/oauth2/token` with the `igdb-mcp/read` scope. Matching requires one unique Steam external-game identity; ambiguous matches are omitted instead of guessing names.

Gamalytic uses `/steam-games/list` with selected AppIDs and `steamId,copiesSold,revenue` fields. Its free response can omit revenue even when copies are present. Estimates refer to provider methodology, not audited sales.

## Realtime behavior

Every collection makes fresh provider requests using `cache: no-store`. No full game records, datasets, snapshots, or result caches are written or retained between collection requests. Automatic discovery temporarily keeps compact pending previews in process memory for approval; they expire after 30 minutes and contain no collected statistics. Short-lived OAuth tokens and request-rate coordination also remain in memory. Providers may independently cache their own data.

Requests are spaced per provider (Steam 1.5 seconds) and have timeouts. Ordinary HTTP calls retry transient failures once; 429 responses trigger a cooldown. Steam enrichment takes up to four requests per game, so ten games usually take at least about a minute. The route permits 180 seconds; hosting must support that duration. Concurrent callers share process-local queues; this is not a distributed rate limiter.

The old corpus scripts remain available for legacy experimentation but are not used by this collector. No corpus generation, embedding, or database setup is needed.

## Verification

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm collector:smoke 739630 1966720
```

The smoke command prints structured JSON to stdout and writes no game files. It exits nonzero for invalid input or failed Steam selections; inspect `collection.issues` for optional enrichment failures. Automated tests mock providers; the smoke command calls the real services.

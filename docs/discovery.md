# Automatic live game discovery

`POST /api/games/discover` accepts natural language and returns up to ten matching games with their full collector data. It uses the configured xAI key; there is no manual game list or keyword-only fallback.

```json
{"query":"multiplayer horror games","limit":10}
```

`query` must contain 3–2000 characters. `limit` defaults to ten and accepts integers from one to ten. Unknown properties are rejected.

## Request flow

1. Grok interprets the query into a summary, must-have requirements, exclusions, multiplayer preference, and up to two semantic search queries.
2. IGDB MCP searches live for up to forty candidates per query. The backend deduplicates them, checks explicit multiplayer requirements against IGDB mode metadata, and sends at most sixty candidates to Grok.
3. Grok ranks up to twenty matching candidates and explains each match. IDs must belong to the retrieved set and cannot repeat. A candidate's description is treated as data, not instructions.
4. The backend resolves exact Steam external-game identities from IGDB. Ambiguous mappings are omitted.
5. The live collector retrieves the highest-ranked games' Steam descriptions, prices, reviews, three comments, tags, and optional IGDB/Gamalytic enrichment. If Steam cannot load a selected game, lower-ranked Grok selections can replace it.
6. The API returns structured facts and separately labelled AI match reasons. Fewer results are returned when there are not enough verified matches; the list is never padded with unrelated games.

## Response

`{ok:true,data:{query,intent,games,failures,discovery},meta:{mode:"live",durationMs}}`

Each game has the complete [collector contract](collector.md), plus `match:{source:"xai",reason,candidateIgdbId}`. Names are at `identity.name`; descriptions at `metadata.summary`. The discovery object records the model, candidate count, ranked count, Steam candidate count, requested/returned counts, completeness, and shortfall issues.

A successful search with no matches returns 200 with an empty games array and `complete:false`. Input errors return 400. AI configuration, AI output, or discovery-provider failures return 503 with a typed safe error. Unexpected internal errors return 500. Optional enrichment failures remain per-game collector issues.

## Configuration and boundaries

Set `XAI_API_KEY`, `IGDB_MCP_CLIENT_ID`, and `IGDB_MCP_CLIENT_SECRET` in root `.env.local`. `XAI_MODEL` defaults to `grok-4.6`, verified against the account's model list when implemented. The backend calls xAI directly through `@ai-sdk/xai` and AI SDK structured outputs.

Each successful nonempty discovery normally makes two paid Grok requests. Each AI stage has a 45-second timeout and a 4,000-output-token limit. Transient provider failures can retry once within that deadline. Input descriptions and candidate metadata are sent to xAI for interpretation/ranking. Responses API storage is disabled with `store:false`. This does not control a provider's other retention policies.

No game data, prompts, or discovery results are stored locally. HTTP responses and fetches use `no-store`; existing OAuth token and request gate coordination is retained. This endpoint permits 300 seconds; the host must support long requests. Ten-game collection alone usually takes about a minute; search, ranking, identity resolution, and replacement candidates add latency.

Similarity and requirement matching are model judgments, not guaranteed exhaustive search. The backend validates IDs, schemas, and multiplayer evidence; it does not independently prove every free-text preference. Sources can omit data or be unavailable. Missing revenue remains null.

The frontend and older `/api/discover` contract are unchanged. This endpoint is the backend entry point for the new live workflow. Market analysis and revenue prediction are still separate future work.

## Run

```bash
corepack pnpm discovery:smoke "multiplayer horror games"
```

The command prints complete JSON without writing game files. Its exit status is nonzero for errors or fewer than ten verified games. Tests mock providers; the smoke command uses the real configured accounts.

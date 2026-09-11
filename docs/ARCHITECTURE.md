# ReleaseSignal architecture

ReleaseSignal is a stateless, approval-gated market intelligence application. Runtime requests collect current provider data and return structured results without persisting game records.

## Dependency direction

```text
app/api + components
        ↓
lib/application
        ↓
lib/domain

lib/infrastructure implements external data access used by application workflows.
lib/api contains transport helpers and the browser client.
lib/session owns browser-side analysis snapshots.
```

- `lib/domain` contains provider-independent contracts, schemas, and deterministic scoring.
- `lib/application` coordinates concept interpretation, discovery approval, and market analysis.
- `lib/infrastructure` contains Steam, IGDB, Gamalytic, Grok, MCP, and corpus adapters.
- `app/api` validates HTTP input, invokes one use case, and formats the response.
- `components` are grouped by the product flow: landing, concept, comparables, analysis, and shared UI.

## Primary request flow

1. `POST /api/games/discover` validates the concept before any game search.
2. The user reviews up to ten candidate names and approves the evidence cohort.
3. `POST /api/games/discover/collect` collects current structured facts for approved Steam AppIDs.
4. `POST /api/analyze` recomputes similarity and produces revenue, reception, saturation, and launch-risk outputs.
5. The browser freezes the result as a snapshot for navigation and export.

The legacy corpus routes remain available for compatibility. The interactive product flow uses live collection and does not store collected games.

## Enforced boundaries

`tests/architecture/boundaries.test.ts` prevents domain code from importing outer layers, prevents React components from importing provider adapters, and rejects reintroduction of the old source directories.

# HTTP API

Every route uses JSON unless stated otherwise. Responses disable storage with `Cache-Control: no-store`.

## Interactive flow

### `POST /api/games/discover`

Accepts `{ query, limit, clarifications? }`. It validates the description first. The response either asks up to three clarifying questions or returns candidate game names for approval. No detailed game collection occurs at this stage.

### `POST /api/games/discover/collect`

Accepts a preview ID and either `approveAll: true` or selected Steam AppIDs from that preview. It returns live normalized game records plus typed collection failures. Preview IDs are short-lived and process-local.

### `POST /api/analyze`

Accepts the game concept, one to ten scored competitors, and a 26–52 week horizon. It returns the market report used by the investment memo. Compatibility inputs for normalized comparables and corpus AppIDs remain supported.

### `POST /api/export/json`

Accepts a complete frozen snapshot and returns a downloadable JSON export.

### `GET /api/health`

Reports configuration and runtime mode without probing or exposing provider credentials.

## Supporting routes

- `POST /api/concept/analyze` extracts a structured concept.
- `POST /api/concept/import` reads an uploaded concept document.
- `POST /api/games/collect` collects explicit Steam AppIDs without discovery.
- `GET /api/games/:appId` returns a single game record.
- `POST /api/games/search` and `POST /api/discover` support compatibility workflows.

Errors use `{ ok: false, error: { code, message }, meta? }`; successful routes use `{ ok: true, data, meta }`.

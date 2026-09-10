# Testing and operations runbook

Install locked dependencies and configure the root environment before live checks:

```bash
corepack pnpm install --frozen-lockfile
cp .env.example .env.local
```

Required discovery settings are `XAI_API_KEY`, `IGDB_MCP_CLIENT_ID`, and `IGDB_MCP_CLIENT_SECRET`. Steam store endpoints and the free Gamalytic list endpoint require no collector key.

Run deterministic verification first:

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm exec eslint lib/discovery lib/collector app/api/games
corepack pnpm build
```

Then exercise live providers:

```bash
corepack pnpm discovery:smoke "multiplayer horror games"
corepack pnpm discovery:smoke --approve-all "multiplayer horror games"
corepack pnpm collector:smoke 739630
```

The first discovery command prints a compact preview. The second performs preview and approved collection in one process so the in-memory record remains available. Smoke commands write JSON to stdout and do not create game datasets.

When troubleshooting, check `/api/health` for configuration presence and discovery-store settings. A missing preview after restart is expected. Use provider issue codes for partial failures, retry 429 responses after cooldown, and treat missing Gamalytic revenue as valid optional data.

Before release, confirm the working tree is clean, documentation links resolve, tests and build pass, secrets remain ignored, and no frontend files changed during backend-only work.

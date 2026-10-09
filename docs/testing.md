# Testing

Run the same checks used by CI:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Tests mirror the production architecture:

- `tests/domain/scoring` checks deterministic scoring invariants.
- `tests/domain` checks runtime schemas.
- `tests/application` checks use-case orchestration and preview lifecycle.
- `tests/infrastructure` checks provider parsing, normalization, failure handling, and MCP behavior.
- `tests/api` checks route contracts and export behavior.
- `tests/architecture` checks dependency boundaries and directory conventions.
- `tests/session` checks browser persistence and immutable snapshots.

Provider tests mock network boundaries. Smoke scripts are the explicit way to exercise configured live providers.

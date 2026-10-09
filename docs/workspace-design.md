# Analysis workspace design

## Context and goals

A Steam game team moves from a written concept to approved comparables to a launch decision. Keep the public homepage intact. Give the product a persistent workspace with three real sequential stages, visible evidence, and an obvious next action.

The direction combines the Awesome Design Skills `sleek` spacing and hierarchy rules with `frontend-design` guidance. Its reference light palette is adapted to ReleaseSignal’s established dark identity. The defining product element is the selectable release-week ledger, rather than decorative dashboard tiles.

## Design tokens and foundations

- Background: `--ws-bg`, #10131b.
- Panels: `--ws-panel`, #171c27; raised surfaces: `--ws-raised`, #1d2432.
- Boundaries: `--ws-border`, #2a3345.
- Primary text: `--ws-text`, #f1f4fb; secondary text: `--ws-muted`, #a7b3c8.
- Interactive accent: `--ws-accent`, #89a8ff. Success, warning, and danger identify evidence and risk, rather than decorate the page.
- Keep the existing Sora display and Inter body families to retain the product identity. Numbers use tabular figures. Ordinary labels use sentence case.
- Use an 8px spacing rhythm, 24px panel padding, 7px control corners, and 12px primary panel corners.
- Align content to the left. Keep descriptions under 80 characters per line where possible. Use 12–15px body text and 26–36px page titles.

## Component-level rules

- Desktop: 224px persistent sidebar, breadcrumb/status bar, and flexible content. At 1000px, the sidebar becomes a horizontal stage navigation. At 720px, content becomes one column.
- Concept editor: title and field guidance, spacious textarea, character/validation guidance, primary search action. Clarifications, interpreted concept, tags, and approval retain their existing flows.
- Comparables: one evidence ledger with game artwork, similarity, facts, and estimates. Details expand on demand. A separate launch-assumptions panel holds date, price, and the next action.
- Analytics: recommendation, compact fact strip, month-filtered release ledger, commercial outlook, reception, and supporting charts. Expand a week to inspect its actual competition.
- Default, hover, focus, disabled, busy, empty, and failure states must remain visible. Inputs have explicit labels. Discovery and collection disable actions that would change an in-progress selection.
- Preserve PDF and JSON exports and session restoration. Mark missing evidence as unavailable; a measured zero stays zero.

## Accessibility acceptance criteria

- At a 390px viewport there must be no horizontal document overflow.
- Every control is keyboard reachable with a visible focus indicator; locked stages are disabled.
- Month controls expose `aria-pressed`; week controls expose `aria-expanded` and identify their detail region.
- Risk colors accompany numeric scores and descriptive accessible names.
- Checkboxes keep an associated text label. Icon-only tag controls have accessible names.
- Follow the existing reduced-motion preference. Do not introduce unsolicited continuous motion.

## Content and tone

Name the next action: “Find comparable games,” “Approve 6 games,” and “Build launch intelligence.” Explain unavailable data and how to proceed. Do not label tag overlap as semantic evidence or suggest unmeasured seasonal factors.

## Anti-patterns and migration

Avoid illustrated revenue outcomes, full-card image overlays, repeated decorative uppercase labels, and gradients behind every panel. Group related evidence in rows rather than a wall of identical cards. Workspace styles are scoped to `.workspace`; public homepage styles and provider/scoring behavior are retained.

## QA checklist

- Walk concept, clarifications, candidate selection, approval, comparables, and analytics.
- Check genre add/remove, disabled empty approval, month filters, week details, and restored session.
- Check unavailable revenue/reviews and error states.
- Verify JSON download against the saved snapshot and PDF print styling.
- Inspect desktop and 390px mobile screenshots; confirm no browser exceptions.
- Run TypeScript, ESLint, the existing regression tests, and a production build.

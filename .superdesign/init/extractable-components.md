# Extractable components

## RootProductHeader
- Source: `app/layout.tsx`
- Category: layout
- Description: Compact ReleaseSignal brand bar shown throughout the application.
- Extractable props: none.
- Hardcoded: radar icon, product wordmark, border and dimensions.

## StepPills
- Source: `components/shared/StepPills.tsx`
- Category: layout
- Description: Three-step journey navigation with active, completed, and locked states.
- Extractable props: `active`, `unlocked`, `onNavigate`.
- Hardcoded: labels, icons, ordering, visual styles.

## ScoreBar
- Source: `components/shared/ScoreBar.tsx`
- Category: basic
- Description: Numeric risk meter with a semantic band.
- Extractable props: `score`, `band`, `label`.
- Hardcoded: semantic color mapping and 100-point scale.

## ProvenanceTag
- Source: `components/shared/ProvenanceTag.tsx`
- Category: basic
- Description: Hoverable disclosure for data source, estimation status, and method.
- Extractable props: `sourced`.
- Hardcoded: provider color mapping and tooltip structure.

## LoadingSkeleton
- Source: `components/shared/LoadingSkeleton.tsx`
- Category: basic
- Description: Pulse placeholder that accepts layout classes.
- Extractable props: `className`.
- Hardcoded: pulse and base surface styles.

## DriverList
- Source: `components/shared/DriverList.tsx`
- Category: basic
- Description: Parallel labels and numeric contributions for model explanations.
- Extractable props: `drivers`.
- Hardcoded: compact typography and plus-sign formatting.

## CompetitorCard
- Source: `components/comparables/CompetitorCard.tsx`
- Category: basic
- Description: Comparable game summary with key commercial evidence and similarity.
- Extractable props: `competitor`, `onDetails`, `onRemove`.
- Hardcoded: metric arrangement and Steam action.

## VerdictCard
- Source: `components/analysis/VerdictCard.tsx`
- Category: basic
- Description: Final KEEP, MOVE, or MITIGATE recommendation with rationale.
- Extractable props: `verdict`.
- Hardcoded: verdict color mapping and label hierarchy.

## RevenueRange
- Source: `components/analysis/RevenueRange.tsx`
- Category: basic
- Description: Conservative, base, and upside revenue forecast visualization.
- Extractable props: `revenue`.
- Hardcoded: axis structure, currency formatting, evidence copy.

## ReleaseCalendar
- Source: `components/analysis/ReleaseCalendar.tsx`
- Category: basic
- Description: Weekly launch collision list with expandable week evidence.
- Extractable props: `weeks`.
- Hardcoded: score bands and weekly row layout.

# Page dependency trees

## `/` — ReleaseSignal application

Entry: `app/page.tsx`

Dependencies:
- `app/layout.tsx`
  - `app/globals.css`
- `components/landing/WelcomePhase.tsx`
- `components/concept/DescribePhase.tsx`
  - `components/shared/StepPills.tsx`
  - `lib/mock-data.ts`
  - `lib/api/client.ts`
- `components/comparables/ComparablesPhase.tsx`
  - `components/shared/StepPills.tsx`
  - `components/comparables/CompetitorGrid.tsx`
    - `components/comparables/CompetitorCard.tsx`
      - `components/comparables/SimilarityBadge.tsx`
      - `components/shared/ProvenanceTag.tsx`
  - `components/comparables/CompetitorDrawer.tsx`
    - `components/comparables/SimilarityBadge.tsx`
    - `components/shared/ProvenanceTag.tsx`
  - `components/shared/StaleSnapshotBanner.tsx`
- `components/analysis/AnalyticsPhase.tsx`
  - `components/shared/StepPills.tsx`
  - `components/analysis/VerdictCard.tsx`
  - `components/analysis/RevenueRange.tsx`
    - `components/shared/ProvenanceTag.tsx`
  - `components/analysis/ReceptionLine.tsx`
    - `components/shared/ProvenanceTag.tsx`
  - `components/analysis/SaturationPanel.tsx`
    - `components/shared/ScoreBar.tsx`
    - `components/shared/DriverList.tsx`
  - `components/analysis/ReleaseCalendar.tsx`
    - `components/analysis/WeekDetail.tsx`
  - `components/analysis/ExportBar.tsx`
  - `components/analysis/PrintReport.tsx`
  - `components/shared/StaleSnapshotBanner.tsx`
- `lib/api/client.ts`
- `lib/session/launch-inputs.ts`
- `lib/session/store.ts`
- `lib/session/snapshot.ts`
- `lib/domain/scoring/competitor.ts`
- `lib/domain/types.ts`

Rendered branches:
- `phase === "landing"`: `WelcomePhase`
- `phase === "describe"`: `DescribePhase`
- `phase === "comparables" && concept`: `ComparablesPhase`
- otherwise: `AnalyticsPhase`

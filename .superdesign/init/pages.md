# Page dependency trees

## `/` — ReleaseSignal application

Entry: `app/page.tsx`

Dependencies:
- `app/layout.tsx`
  - `app/globals.css`
- `components/phases/WelcomePhase.tsx`
- `components/phases/DescribePhase.tsx`
  - `components/phases/StepPills.tsx`
  - `lib/mock-data.ts`
  - `lib/api/client.ts`
- `components/phases/ComparablesPhase.tsx`
  - `components/phases/StepPills.tsx`
  - `components/comparables/CompetitorGrid.tsx`
    - `components/comparables/CompetitorCard.tsx`
      - `components/comparables/SimilarityBadge.tsx`
      - `components/shared/ProvenanceTag.tsx`
  - `components/comparables/CompetitorDrawer.tsx`
    - `components/comparables/SimilarityBadge.tsx`
    - `components/shared/ProvenanceTag.tsx`
  - `components/shared/StaleSnapshotBanner.tsx`
- `components/phases/AnalyticsPhase.tsx`
  - `components/phases/StepPills.tsx`
  - `components/forecast/VerdictCard.tsx`
  - `components/forecast/RevenueRange.tsx`
    - `components/shared/ProvenanceTag.tsx`
  - `components/forecast/ReceptionLine.tsx`
    - `components/shared/ProvenanceTag.tsx`
  - `components/forecast/SaturationPanel.tsx`
    - `components/shared/ScoreBar.tsx`
    - `components/shared/DriverList.tsx`
  - `components/forecast/ReleaseCalendar.tsx`
    - `components/forecast/WeekDetail.tsx`
  - `components/forecast/ExportBar.tsx`
  - `components/forecast/PrintReport.tsx`
  - `components/shared/StaleSnapshotBanner.tsx`
- `lib/api/client.ts`
- `lib/session/launch-inputs.ts`
- `lib/session/store.ts`
- `lib/session/snapshot.ts`
- `lib/scoring/competitor.ts`
- `lib/types.ts`

Rendered branches:
- `phase === "landing"`: `WelcomePhase`
- `phase === "describe"`: `DescribePhase`
- `phase === "comparables" && concept`: `ComparablesPhase`
- otherwise: `AnalyticsPhase`

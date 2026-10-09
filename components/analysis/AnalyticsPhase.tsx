"use client";

import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  ShieldCheck,
  Star,
} from "lucide-react";
import { ComparableRevenueChart } from "@/components/analysis/ComparableRevenueChart";
import { ExportBar } from "@/components/analysis/ExportBar";
import { LaunchRiskChart } from "@/components/analysis/LaunchRiskChart";
import { PrintReport } from "@/components/analysis/PrintReport";
import { ReleaseCalendar } from "@/components/analysis/ReleaseCalendar";
import { WorkspaceShell } from "@/components/shared/WorkspaceShell";
import type { Step } from "@/components/shared/StepPills";
import type {
  GameConcept,
  MarketReport,
  ScoredCompetitor,
  Snapshot,
} from "@/lib/domain/types";

interface Props {
  report: MarketReport | null;
  concept: GameConcept | null;
  competitors: ScoredCompetitor[];
  snapshot: Snapshot | null;
  resultsStale: boolean;
  unlockedSteps: Step[];
  onNavigate: (step: Step) => void;
  onStartNewSession: () => void;
}

function money(value: number | null): string {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

const VERDICT_LABELS = {
  KEEP: "Keep your planned release week.",
  MOVE: "A stronger launch window is available.",
  MITIGATE: "Plan around the competition.",
  INSUFFICIENT_DATA: "More evidence is needed.",
};

export default function AnalyticsPhase({
  report,
  concept,
  competitors,
  snapshot,
  resultsStale,
  unlockedSteps,
  onNavigate,
  onStartNewSession,
}: Props) {
  if (!report)
    return (
      <WorkspaceShell
        active="launch-window"
        unlocked={unlockedSteps}
        onNavigate={onNavigate}
        onStartNewSession={onStartNewSession}
      >
        <section className="ws-panel">
          <div className="ws-empty">
            <CalendarDays size={32} />
            <h2>Your launch intelligence is next.</h2>
            <p>
              Review your comparable games and set a planned release date to
              build an analysis.
            </p>
            <button
              type="button"
              className="ws-button mt-5"
              onClick={() => onNavigate("comparables")}
            >
              Return to comparables
            </button>
          </div>
        </section>
      </WorkspaceShell>
    );
  const currentWeek = report.releaseWindows.find(
    (window) =>
      report.verdict.currentDate &&
      report.verdict.currentDate >= window.weekStart &&
      report.verdict.currentDate < window.weekEnd,
  );
  const knownRevenue =
    report.revenue.base !== null &&
    report.revenue.conservative !== null &&
    report.revenue.upside !== null;
  const positive = report.reception.predictedPositiveRatio;
  const verdictTone =
    report.verdict.decision === "KEEP"
      ? "green"
      : report.verdict.decision === "MOVE"
        ? "blue"
        : report.verdict.decision === "MITIGATE"
          ? "amber"
          : "";
  return (
    <>
      <div className="screen-report">
        <WorkspaceShell
          active="launch-window"
          unlocked={unlockedSteps}
          onNavigate={onNavigate}
          onStartNewSession={onStartNewSession}
        >
          <header className="ws-page-heading">
            <div>
              <span className="ws-step-caption">Step 3 of 3</span>
              <h1>Find your opening.</h1>
              <p>
                Your launch outlook, grounded in {competitors.length} comparable
                games and the upcoming release landscape.
              </p>
            </div>
            {snapshot ? (
              <ExportBar snapshot={snapshot} />
            ) : (
              <button
                type="button"
                className="ws-button secondary"
                onClick={() => onNavigate("comparables")}
              >
                <ArrowLeft size={14} /> Adjust assumptions
              </button>
            )}
          </header>
          {resultsStale ? (
            <div className="ws-alert warning">
              This analysis uses your previous inputs. Return to comparables and
              rebuild it to reflect your changes.
            </div>
          ) : null}
          <section className="ws-verdict">
            <span className="ws-verdict-icon">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h2>{VERDICT_LABELS[report.verdict.decision]}</h2>
              {report.verdict.reasoning.map((reason) => (
                <p key={reason}>{reason}</p>
              ))}
            </div>
            <div className="ws-verdict-meta">
              <span className={`ws-badge ${verdictTone}`}>
                {report.verdict.decision.replaceAll("_", " ")}
              </span>
              {report.verdict.recommendedDate ? (
                <p className="text-right">
                  Target {report.verdict.recommendedDate}
                </p>
              ) : null}
            </div>
          </section>
          <div className="ws-stat-strip">
            <div className="ws-stat">
              <span>Planned launch</span>
              <strong className="text-[21px]!">
                {report.verdict.currentDate ?? "Not set"}
              </strong>
              <small>Your current release assumption</small>
            </div>
            <div className="ws-stat">
              <span>Planned week pressure</span>
              <strong>
                {currentWeek ? `${currentWeek.risk}/100` : "Unavailable"}
              </strong>
              <small>
                {currentWeek?.band.toLowerCase() ?? "No measured risk"}
              </small>
            </div>
            <div className="ws-stat">
              <span>Market saturation</span>
              <strong>{report.saturation.score}/100</strong>
              <small>{report.saturation.band.toLowerCase()} saturation</small>
            </div>
            <div className="ws-stat">
              <span>Revenue confidence</span>
              <strong>{report.revenue.confidence.toLowerCase()}</strong>
              <small>
                {report.revenue.basedOnCount} usable commercial comparables
              </small>
            </div>
          </div>
          <div className="ws-insight-grid">
            <section className="ws-panel">
              <div className="ws-panel-head">
                <div>
                  <h2>Choose your launch week</h2>
                  <p>
                    {report.releaseData.datedCount} dated releases in the{" "}
                    {report.releaseWindows.length || "selected"}-week horizon.
                    Risk reflects measured competitor pressure.
                  </p>
                </div>
                <span
                  className={`ws-badge ${report.releaseData.status === "live" ? "green" : "red"}`}
                >
                  {report.releaseData.status === "live"
                    ? "Live releases"
                    : "Unavailable"}
                </span>
              </div>
              {report.releaseData.issues.length ? (
                <div className="ws-alert warning m-4">
                  {report.releaseData.issues.join(" ")}
                </div>
              ) : null}
              <ReleaseCalendar
                windows={report.releaseWindows}
                currentDate={report.verdict.currentDate}
                recommendedDate={report.verdict.recommendedDate}
              />
              {report.undatedReleases.length ? (
                <details className="ws-panel-body border-t border-[var(--ws-border)]">
                  <summary className="ws-text-button cursor-pointer">
                    {report.undatedReleases.length} related releases with
                    uncertain timing
                  </summary>
                  <div className="ws-stack mt-4">
                    {report.undatedReleases.map((release) => (
                      <div key={release.igdbId} className="text-[12px]">
                        <strong className="font-medium">{release.name}</strong>
                        <p className="ws-muted text-[11px] mt-1">
                          {release.dateLabel} · {release.similarity}% similar
                        </p>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
            </section>
            <aside className="ws-stack">
              <section className="ws-panel">
                <div className="ws-panel-head">
                  <div>
                    <h2>Commercial outlook</h2>
                    <p>Estimated gross revenue, in USD.</p>
                  </div>
                  <CircleDollarSign size={18} className="ws-muted" />
                </div>
                {knownRevenue ? (
                  <div className="ws-revenue-rows">
                    <div className="ws-revenue-row">
                      <div>
                        <span>Conservative</span>
                        <small>25th percentile outcome</small>
                      </div>
                      <strong>{money(report.revenue.conservative)}</strong>
                    </div>
                    <div className="ws-revenue-row is-base">
                      <div>
                        <span>Base case</span>
                        <small>Similarity-weighted median</small>
                      </div>
                      <strong>{money(report.revenue.base)}</strong>
                    </div>
                    <div className="ws-revenue-row">
                      <div>
                        <span>Upside</span>
                        <small>80th percentile outcome</small>
                      </div>
                      <strong>{money(report.revenue.upside)}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="ws-empty">
                    <CircleDollarSign size={26} />
                    <h3>Insufficient revenue evidence</h3>
                    <p>
                      No range is calculated when comparable revenue is
                      unavailable.
                    </p>
                  </div>
                )}
                <div className="ws-panel-body border-t border-[var(--ws-border)]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] ws-muted">Target price</span>
                    <strong className="text-[12px] font-medium">
                      {concept?.commercial.priceUsd == null
                        ? "Not provided"
                        : `$${concept.commercial.priceUsd.toFixed(2)}`}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] ws-muted">
                      Evidence confidence
                    </span>
                    <span className="ws-badge">
                      {report.revenue.confidence}
                    </span>
                  </div>
                  <p className="text-[10px] ws-muted mt-3 leading-6">
                    {report.revenue.basedOnCount} usable comparables.{" "}
                    {report.revenue.method}.
                  </p>
                </div>
              </section>
              <section className="ws-panel">
                <div className="ws-panel-head">
                  <h2>Player reception</h2>
                  <Star size={17} className="ws-muted" />
                </div>
                <div className="ws-panel-body">
                  {positive === null ? (
                    <p className="text-[12px] ws-muted leading-6">
                      Insufficient review evidence for a prediction.
                    </p>
                  ) : (
                    <div className="ws-reception">
                      <strong>{Math.round(positive * 100)}%</strong>
                      <div>
                        <p>Predicted positive reviews</p>
                        <small>
                          {report.reception.band.toLowerCase()} confidence
                        </small>
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] ws-muted mt-4">
                    Comparable median:{" "}
                    {report.reception.cohortMedian === null
                      ? "unavailable"
                      : `${Math.round(report.reception.cohortMedian * 100)}% positive`}
                  </p>
                </div>
              </section>
            </aside>
          </div>
          <div className="ws-chart-pair">
            <section className="ws-panel">
              <div className="ws-panel-head">
                <div>
                  <h2>Pressure across the horizon</h2>
                  <p>Weekly collision risk, from 0 to 100.</p>
                </div>
                <CalendarDays size={18} className="ws-muted" />
              </div>
              <div className="ws-panel-body">
                <LaunchRiskChart
                  windows={report.releaseWindows}
                  currentDate={report.verdict.currentDate}
                  recommendedDate={report.verdict.recommendedDate}
                />
              </div>
            </section>
            <section className="ws-panel">
              <div className="ws-panel-head">
                <div>
                  <h2>The commercial evidence</h2>
                  <p>Available provider estimates, ordered by relevance.</p>
                </div>
                <CircleDollarSign size={18} className="ws-muted" />
              </div>
              <div className="ws-panel-body">
                <ComparableRevenueChart competitors={competitors} />
              </div>
            </section>
          </div>
          {report.revenue.drivers.length || report.saturation.drivers.length ? (
            <details className="ws-panel">
              <summary className="ws-panel-body cursor-pointer text-[13px] font-medium">
                How this outlook was calculated
              </summary>
              <div className="ws-panel-body border-t border-[var(--ws-border)] grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-[12px] font-medium mb-3">
                    Revenue evidence
                  </h3>
                  {report.revenue.drivers.map((item) => (
                    <p
                      key={`${item.label}-${item.detail}`}
                      className="text-[11px] ws-muted leading-6 mb-2"
                    >
                      {item.detail}
                    </p>
                  ))}
                </div>
                <div>
                  <h3 className="text-[12px] font-medium mb-3">
                    Market pressure
                  </h3>
                  {report.saturation.drivers.map((item) => (
                    <p
                      key={`${item.label}-${item.detail}`}
                      className="text-[11px] ws-muted leading-6 mb-2"
                    >
                      {item.detail}
                    </p>
                  ))}
                </div>
              </div>
            </details>
          ) : null}
          <div className="flex items-center justify-between gap-3 mt-6">
            <p className="ws-safety-note">
              <ShieldCheck size={14} className="shrink-0 mt-0.5" /> Estimates
              inform decisions; they don’t guarantee outcomes.
            </p>
            <button
              type="button"
              className="ws-text-button shrink-0"
              onClick={() => onNavigate("comparables")}
            >
              <ArrowLeft size={13} /> Adjust assumptions
            </button>
          </div>
        </WorkspaceShell>
      </div>
      {snapshot ? <PrintReport snapshot={snapshot} /> : null}
    </>
  );
}

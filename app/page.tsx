"use client";

import { useCallback, useEffect, useState } from "react";
import WelcomePhase from "@/components/phases/WelcomePhase";
import DescribePhase from "@/components/phases/DescribePhase";
import ComparablesPhase from "@/components/phases/ComparablesPhase";
import AnalyticsPhase from "@/components/phases/AnalyticsPhase";
import type { Step } from "@/components/phases/StepPills";
import {
  analyzeDescription,
  analyzeMarket,
  ApiClientError,
  collectApprovedGames,
  discoverGamePreview,
  type DiscoveryCandidate,
  type DiscoveryValidation,
} from "@/lib/api/client";
import {
  analysisHorizonWeeks,
  dateInputValue,
  launchDateError,
} from "@/lib/session/launch-inputs";
import {
  SESSION_STORAGE_KEY,
  useSessionStore,
} from "@/lib/session/store";
import {
  createSnapshot,
  snapshotFromImport,
} from "@/lib/session/snapshot";
import { scoreCompetitor } from "@/lib/scoring/competitor";
import type {
  GameConcept,
  GameMode,
  Perspective,
} from "@/lib/types";

type DiscoveryStage = "idle" | "validating" | "collecting";

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "The request failed. Please try again.";
}

function buildQuery(description: string, genres: string[]): string {
  const extraTags = genres.length ? `\n\nUser-selected discovery tags: ${genres.join(", ")}.` : "";
  return `${description.trim()}${extraTags}`;
}

function fallbackConcept(query: string, validation: DiscoveryValidation): GameConcept {
  const names = (category: DiscoveryValidation["tags"][number]["category"]) =>
    validation.tags.filter((tag) => tag.category === category).map((tag) => tag.name);
  const genres = names("genre");
  const modeNames = names("mode").map((name) => name.toLocaleLowerCase());
  const gameModes: GameMode[] = [];
  if (modeNames.some((name) => name.includes("co-op") || name.includes("coop"))) {
    gameModes.push("Online Co-op");
  }
  if (modeNames.some((name) => name.includes("pvp"))) gameModes.push("Online PvP");
  if (modeNames.some((name) => name.includes("single"))) gameModes.push("Singleplayer");

  const perspectiveName = names("perspective")[0]?.toLocaleLowerCase();
  const perspectives: Record<string, Perspective> = {
    "first person": "First person",
    "third person": "Third person",
    isometric: "Isometric",
    "side view": "Side view",
    "top down": "Top down",
    text: "Text",
  };

  return {
    version: 1,
    concept: {
      title: null,
      shortDescription: validation.normalizedDescription.slice(0, 300),
      rawText: query,
      platforms: ["PC"],
      targetSteam: true,
    },
    taxonomy: {
      primaryGenre: genres[0] ?? null,
      secondaryGenres: genres.slice(1),
      themes: [...names("theme"), ...names("setting"), ...names("tone")],
      mechanics: names("mechanic"),
      gameModes,
      perspective: perspectiveName ? perspectives[perspectiveName] ?? null : null,
    },
    commercial: {
      priceUsd: null,
      plannedRelease: null,
      teamSize: null,
      isFirstTitle: null,
    },
    confidence: {
      primaryGenre: genres.length ? validation.confidence : 0,
      mechanics: names("mechanic").length ? validation.confidence : 0,
      gameModes: gameModes.length ? validation.confidence : 0,
      perspective: perspectiveName ? validation.confidence : 0,
    },
    missingImportantFields: [
      ...(genres.length ? [] : ["primaryGenre" as const]),
      ...(names("mechanic").length ? [] : ["mechanics" as const]),
      ...(gameModes.length ? [] : ["gameModes" as const]),
      ...(perspectiveName ? [] : ["perspective" as const]),
      "priceUsd",
      "plannedRelease",
    ],
  };
}

export default function Home() {
  const session = useSessionStore();
  const {
    phase, description, genres, concept, validation, questions, competitors,
    report, snapshot, resultsStale, hasHydrated, patchSession, resetSession,
    rehydrateSession,
  } = session;
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([]);
  const [selectedSteamAppIds, setSelectedSteamAppIds] = useState<number[]>([]);
  const [discoveryStage, setDiscoveryStage] = useState<DiscoveryStage>("idle");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void rehydrateSession();
    const syncSession = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY || event.key === null) void rehydrateSession();
    };
    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, [rehydrateSession]);

  const unlockedSteps: Step[] = [
    "describe",
    ...(competitors.length ? ["comparables" as const] : []),
    ...(report ? ["launch-window" as const] : []),
  ];

  const navigateStep = useCallback((step: Step) => {
    if (step === "comparables" && !competitors.length) return;
    if (step === "launch-window" && !report) return;
    patchSession({
      phase: step === "launch-window" ? "analytics" : step,
    });
    setError(null);
  }, [competitors.length, patchSession, report]);

  const clearPreview = useCallback(() => {
    setPreviewId(null);
    setCandidates([]);
    setSelectedSteamAppIds([]);
    setError(null);
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    clearPreview();
    patchSession({
      description: value,
      validation: null,
      questions: [],
      resultsStale: Boolean(competitors.length || report),
    });
  }, [clearPreview, competitors.length, patchSession, report]);

  const handleGenresChange = useCallback((value: string[]) => {
    clearPreview();
    patchSession({
      genres: value,
      validation: null,
      questions: [],
      resultsStale: Boolean(competitors.length || report),
    });
  }, [clearPreview, competitors.length, patchSession, report]);

  const startNewSession = useCallback(() => {
    resetSession();
    setPreviewId(null);
    setCandidates([]);
    setSelectedSteamAppIds([]);
    setDiscoveryStage("idle");
    setAnalysisLoading(false);
    setError(null);
  }, [resetSession]);

  const handleImport = useCallback((data: Record<string, unknown>) => {
    const importedSnapshot = snapshotFromImport(data);
    if (importedSnapshot) {
      patchSession({
        phase: "analytics",
        description: importedSnapshot.concept.concept.rawText,
        genres: importedSnapshot.concept.taxonomy.primaryGenre
          ? [importedSnapshot.concept.taxonomy.primaryGenre]
          : [],
        concept: importedSnapshot.concept,
        validation: null,
        questions: [],
        competitors: importedSnapshot.competitors,
        report: importedSnapshot.report,
        snapshot: importedSnapshot,
        resultsStale: false,
      });
      clearPreview();
      return;
    }

    patchSession({
      phase: "describe",
      description: typeof data.description === "string" ? data.description : "",
      genres: Array.isArray(data.genres) ? data.genres.filter((item): item is string => typeof item === "string") : [],
      concept: null,
      validation: null,
      questions: [],
      competitors: [],
      report: null,
      snapshot: null,
      resultsStale: false,
    });
    clearPreview();
  }, [clearPreview, patchSession]);

  const handleAnalyze = useCallback(async (
    clarifications: { question: string; answer: string }[],
  ) => {
    setDiscoveryStage("validating");
    setError(null);
    setPreviewId(null);
    setCandidates([]);
    setSelectedSteamAppIds([]);

    try {
      const result = await discoverGamePreview(
        buildQuery(description, genres),
        clarifications,
        10,
      );
      patchSession({ validation: result.validation });

      if (result.status === "needs_clarification") {
        patchSession({ questions: result.questions });
        return;
      }

      patchSession({ questions: [] });
      setCandidates(result.candidates);
      setPreviewId(result.previewId);
      setSelectedSteamAppIds(result.candidates.map((candidate) => candidate.steamAppId));

      if (result.status === "no_matches") {
        setError(result.discovery.issues[0] ?? "No verified Steam matches were found.");
      }
    } catch (requestError) {
      patchSession({ validation: null, questions: [] });
      setError(errorMessage(requestError));
    } finally {
      setDiscoveryStage("idle");
    }
  }, [description, genres, patchSession]);

  const handleToggleCandidate = useCallback((steamAppId: number) => {
    setSelectedSteamAppIds((previous) =>
      previous.includes(steamAppId)
        ? previous.filter((id) => id !== steamAppId)
        : [...previous, steamAppId],
    );
  }, []);

  const handleSelectAllCandidates = useCallback(() => {
    setSelectedSteamAppIds((previous) =>
      previous.length === candidates.length
        ? []
        : candidates.map((candidate) => candidate.steamAppId),
    );
  }, [candidates]);

  const handleApprove = useCallback(async () => {
    if (!previewId || !validation || !selectedSteamAppIds.length) return;

    setDiscoveryStage("collecting");
    setError(null);
    const query = buildQuery(description, genres);
    const [collectionResult, conceptResult] = await Promise.allSettled([
      collectApprovedGames(previewId, selectedSteamAppIds),
      analyzeDescription(query, concept ?? undefined),
    ]);

    try {
      if (collectionResult.status === "rejected") throw collectionResult.reason;
      const extractedConcept = conceptResult.status === "fulfilled"
        ? conceptResult.value.concept
        : fallbackConcept(query, validation);
      const nextConcept: GameConcept = {
        ...extractedConcept,
        commercial: {
          ...extractedConcept.commercial,
          plannedRelease: dateInputValue(extractedConcept.commercial.plannedRelease) || null,
        },
      };
      const nextCompetitors = collectionResult.value.games.map((game) =>
        scoreCompetitor(nextConcept, game, game.match.semanticScore, game.match.reason),
      );
      if (!nextCompetitors.length) throw new Error("No approved game details could be collected.");

      patchSession({
        phase: "comparables",
        concept: nextConcept,
        competitors: nextCompetitors,
        report: null,
        snapshot: null,
        resultsStale: false,
      });
      setPreviewId(null);
      setCandidates([]);
      setSelectedSteamAppIds([]);
      if (collectionResult.value.failures.length) {
        setError(`${collectionResult.value.failures.length} approved game(s) could not be collected.`);
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setDiscoveryStage("idle");
    }
  }, [
    concept, description, genres, patchSession, previewId, selectedSteamAppIds,
    validation,
  ]);

  const handlePlannedReleaseChange = useCallback((value: string) => {
    if (!concept) return;
    patchSession({
      concept: {
        ...concept,
        commercial: { ...concept.commercial, plannedRelease: value || null },
      },
      resultsStale: Boolean(report),
    });
  }, [concept, patchSession, report]);

  const handleTargetPriceChange = useCallback((value: number | null) => {
    if (!concept) return;
    patchSession({
      concept: {
        ...concept,
        commercial: {
          ...concept.commercial,
          priceUsd: value !== null && Number.isFinite(value) && value >= 0 ? value : null,
        },
      },
      resultsStale: Boolean(report),
    });
  }, [concept, patchSession, report]);

  const currentLaunchError = launchDateError(concept?.commercial.plannedRelease ?? null);

  const handleRunPredictions = useCallback(async () => {
    if (!concept || !competitors.length) return;
    const launchError = launchDateError(concept.commercial.plannedRelease);
    if (launchError) {
      setError(launchError);
      return;
    }

    setAnalysisLoading(true);
    setError(null);
    try {
      const horizonWeeks = analysisHorizonWeeks(concept.commercial.plannedRelease!, new Date());
      const result = await analyzeMarket(
        concept,
        competitors,
        horizonWeeks,
      );
      const nextSnapshot = createSnapshot({
        concept,
        competitors,
        report: result.report,
        corpusVersion: result.corpusVersion,
      });
      patchSession({
        phase: "analytics",
        report: result.report,
        snapshot: nextSnapshot,
        resultsStale: false,
      });
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setAnalysisLoading(false);
    }
  }, [concept, competitors, patchSession]);

  if (!hasHydrated) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center text-on-surface-variant text-[13px]">
        Restoring your latest session...
      </div>
    );
  }

  if (phase === "landing") {
    return (
      <WelcomePhase
        onStartScratch={() => patchSession({ phase: "describe" })}
        onImport={handleImport}
      />
    );
  }

  if (phase === "describe") {
    return (
      <DescribePhase
        description={description}
        onDescriptionChange={handleDescriptionChange}
        genres={genres}
        onGenresChange={handleGenresChange}
        validation={validation}
        candidates={candidates}
        selectedSteamAppIds={selectedSteamAppIds}
        questions={questions}
        error={error}
        stage={discoveryStage}
        onAnalyze={handleAnalyze}
        onToggleCandidate={handleToggleCandidate}
        onSelectAllCandidates={handleSelectAllCandidates}
        onApprove={handleApprove}
        onStartNewSession={startNewSession}
        hasCollectedResults={Boolean(competitors.length)}
        unlockedSteps={unlockedSteps}
        onNavigate={navigateStep}
        onViewCollectedResults={() => patchSession({ phase: "comparables" })}
      />
    );
  }

  if (phase === "comparables" && concept) {
    return (
      <ComparablesPhase
        competitors={competitors}
        onNext={handleRunPredictions}
        onBack={() => patchSession({ phase: "describe" })}
        onStartNewSession={startNewSession}
        loading={analysisLoading}
        error={error}
        resultsStale={resultsStale}
        plannedRelease={dateInputValue(concept.commercial.plannedRelease)}
        targetPrice={concept.commercial.priceUsd}
        launchInputError={currentLaunchError}
        unlockedSteps={unlockedSteps}
        onNavigate={navigateStep}
        onPlannedReleaseChange={handlePlannedReleaseChange}
        onTargetPriceChange={handleTargetPriceChange}
      />
    );
  }

  return (
    <AnalyticsPhase
      report={report}
      concept={concept}
      competitors={competitors}
      snapshot={snapshot}
      resultsStale={resultsStale}
      unlockedSteps={unlockedSteps}
      onNavigate={navigateStep}
      onStartNewSession={startNewSession}
    />
  );
}

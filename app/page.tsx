"use client";

import { useCallback, useState } from "react";
import WelcomePhase from "@/components/phases/WelcomePhase";
import DescribePhase from "@/components/phases/DescribePhase";
import ComparablesPhase from "@/components/phases/ComparablesPhase";
import AnalyticsPhase from "@/components/phases/AnalyticsPhase";
import {
  analyzeDescription,
  analyzeMarket,
  ApiClientError,
  collectApprovedGames,
  discoverGamePreview,
  type ApprovedGame,
  type DiscoveryCandidate,
  type DiscoveryValidation,
} from "@/lib/api/client";
import type {
  GameConcept,
  GameMode,
  MarketReport,
  Perspective,
  ScoredCompetitor,
} from "@/lib/types";

export type Phase = "landing" | "describe" | "comparables" | "analytics";
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

function toCompetitor(game: ApprovedGame, validation: DiscoveryValidation): ScoredCompetitor {
  const matched = new Set(game.match.matchedTags.map((tag) => tag.toLocaleLowerCase()));
  const required = validation.tags.filter((tag) => tag.priority === "required");
  const preferred = validation.tags.filter((tag) => tag.priority === "preferred");
  const ratio = (tags: DiscoveryValidation["tags"]) =>
    tags.length
      ? tags.filter((tag) => matched.has(tag.name.toLocaleLowerCase())).length / tags.length
      : 1;
  const score = Math.min(1, ratio(required) * 0.75 + ratio(preferred) * 0.25);

  return {
    game,
    similarity: {
      score,
      rationale: game.match.reason,
      components: {
        semantic: score,
        mechanics: 0,
        genre: 0,
        theme: 0,
        gameMode: 0,
        price: 0,
      },
    },
    competitiveThreat: Math.round(score * 100),
    userAdded: false,
  };
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [concept, setConcept] = useState<GameConcept | null>(null);
  const [validation, setValidation] = useState<DiscoveryValidation | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([]);
  const [selectedSteamAppIds, setSelectedSteamAppIds] = useState<number[]>([]);
  const [competitors, setCompetitors] = useState<ScoredCompetitor[]>([]);
  const [report, setReport] = useState<MarketReport | null>(null);
  const [discoveryStage, setDiscoveryStage] = useState<DiscoveryStage>("idle");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goTo = useCallback((nextPhase: Phase) => setPhase(nextPhase), []);

  const clearPreview = useCallback(() => {
    setValidation(null);
    setQuestions([]);
    setPreviewId(null);
    setCandidates([]);
    setSelectedSteamAppIds([]);
    setError(null);
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
    clearPreview();
  }, [clearPreview]);

  const handleGenresChange = useCallback((value: string[]) => {
    setGenres(value);
    clearPreview();
  }, [clearPreview]);

  const startNewSession = useCallback(() => {
    setPhase("landing");
    setDescription("");
    setGenres([]);
    setConcept(null);
    setValidation(null);
    setQuestions([]);
    setPreviewId(null);
    setCandidates([]);
    setSelectedSteamAppIds([]);
    setCompetitors([]);
    setReport(null);
    setDiscoveryStage("idle");
    setAnalysisLoading(false);
    setError(null);
  }, []);

  const handleImport = useCallback((data: Record<string, unknown>) => {
    if (typeof data.description === "string") setDescription(data.description);
    if (Array.isArray(data.genres)) setGenres(data.genres as string[]);
    setPhase("describe");
  }, []);

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
      setValidation(result.validation);

      if (result.status === "needs_clarification") {
        setQuestions(result.questions);
        return;
      }

      setQuestions([]);
      setCandidates(result.candidates);
      setPreviewId(result.previewId);
      setSelectedSteamAppIds(result.candidates.map((candidate) => candidate.steamAppId));

      if (result.status === "no_matches") {
        setError(result.discovery.issues[0] ?? "No verified Steam matches were found.");
      }
    } catch (requestError) {
      setValidation(null);
      setQuestions([]);
      setError(errorMessage(requestError));
    } finally {
      setDiscoveryStage("idle");
    }
  }, [description, genres]);

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
      const nextConcept = conceptResult.status === "fulfilled"
        ? conceptResult.value.concept
        : fallbackConcept(query, validation);
      const nextCompetitors = collectionResult.value.games.map((game) =>
        toCompetitor(game, validation),
      );

      if (!nextCompetitors.length) {
        throw new Error("No approved game details could be collected.");
      }

      setConcept(nextConcept);
      setCompetitors(nextCompetitors);
      setReport(null);
      if (collectionResult.value.failures.length) {
        setError(`${collectionResult.value.failures.length} approved game(s) could not be collected.`);
      }
      goTo("comparables");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setDiscoveryStage("idle");
    }
  }, [
    concept,
    description,
    genres,
    goTo,
    previewId,
    selectedSteamAppIds,
    validation,
  ]);

  const handleRunPredictions = useCallback(async () => {
    if (!concept || !competitors.length) return;

    setAnalysisLoading(true);
    setError(null);
    try {
      const result = await analyzeMarket(
        concept,
        competitors.map((competitor) => competitor.game),
      );
      setReport(result.report);
      goTo("analytics");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setAnalysisLoading(false);
    }
  }, [concept, competitors, goTo]);

  if (phase === "landing") {
    return <WelcomePhase onStartScratch={() => goTo("describe")} onImport={handleImport} />;
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
      />
    );
  }

  if (phase === "comparables") {
    return (
      <ComparablesPhase
        competitors={competitors}
        onNext={handleRunPredictions}
        onBack={() => goTo("describe")}
        onStartNewSession={startNewSession}
        loading={analysisLoading}
        error={error}
      />
    );
  }

  return (
    <AnalyticsPhase
      report={report}
      concept={concept}
      competitors={competitors}
      onStartNewSession={startNewSession}
    />
  );
}

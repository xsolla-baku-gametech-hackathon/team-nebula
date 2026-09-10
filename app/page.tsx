"use client";

import { useState, useCallback } from "react";
import WelcomePhase from "@/components/phases/WelcomePhase";
import DescribePhase from "@/components/phases/DescribePhase";
import ComparablesPhase from "@/components/phases/ComparablesPhase";
import AnalyticsPhase from "@/components/phases/AnalyticsPhase";
import { analyzeDescription, discoverCompetitors, analyzeMarket } from "@/lib/api/client";
import type { GameConcept, ScoredCompetitor, MarketReport } from "@/lib/types";

export type Phase = "landing" | "describe" | "comparables" | "analytics";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [similarGames, setSimilarGames] = useState<string[]>([]);
  const [concept, setConcept] = useState<GameConcept | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<ScoredCompetitor[]>([]);
  const [report, setReport] = useState<MarketReport | null>(null);
  const [loading, setLoading] = useState(false);

  const goTo = useCallback((p: Phase) => setPhase(p), []);

  const startNewSession = useCallback(() => {
    setPhase("landing");
    setDescription("");
    setGenres([]);
    setSimilarGames([]);
    setConcept(null);
    setAnalyzed(false);
    setQuestions([]);
    setCompetitors([]);
    setReport(null);
  }, []);

  const handleImport = useCallback((data: Record<string, unknown>) => {
    if (typeof data.description === "string") setDescription(data.description);
    if (Array.isArray(data.genres)) setGenres(data.genres as string[]);
    if (Array.isArray(data.similarGames)) setSimilarGames(data.similarGames as string[]);
    setAnalyzed(true);
    setPhase("describe");
  }, []);

  const handleAnalyze = useCallback(async () => {
    try {
      const result = await analyzeDescription(description, concept ?? undefined);
      setConcept(result.concept);
      setQuestions(result.questions.map((q) => q.question));

      if (result.readyToProceed) {
        setAnalyzed(true);
        const t = result.concept.taxonomy;
        const extracted = [t.primaryGenre, ...t.secondaryGenres].filter(Boolean) as string[];
        if (extracted.length) setGenres((prev) => [...new Set([...prev, ...extracted])]);
      }
    } catch (e) {
      console.error("Analyze failed:", e);
      setAnalyzed(true);
    }
  }, [description, concept]);

  const handleDiscover = useCallback(async () => {
    if (!concept) { goTo("comparables"); return; }
    setLoading(true);
    try {
      const result = await discoverCompetitors(concept);
      setCompetitors(result.competitors);
    } catch (e) {
      console.error("Discover failed:", e);
    }
    setLoading(false);
    goTo("comparables");
  }, [concept, goTo]);

  const handleRunPredictions = useCallback(async () => {
    if (!concept) { goTo("analytics"); return; }
    setLoading(true);
    try {
      const appIds = competitors.map((c) => c.game.identity.steamAppId);
      const result = await analyzeMarket(concept, appIds);
      setReport(result.report);
    } catch (e) {
      console.error("Analyze market failed:", e);
    }
    setLoading(false);
    goTo("analytics");
  }, [concept, competitors, goTo]);

  if (phase === "landing") {
    return <WelcomePhase onStartScratch={() => goTo("describe")} onImport={handleImport} />;
  }

  if (phase === "describe") {
    return (
      <DescribePhase
        description={description}
        onDescriptionChange={setDescription}
        genres={genres}
        onGenresChange={setGenres}
        similarGames={similarGames}
        onSimilarGamesChange={setSimilarGames}
        analyzed={analyzed}
        questions={questions}
        onAnalyze={handleAnalyze}
        onNext={handleDiscover}
        onStartNewSession={startNewSession}
        loading={loading}
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
        loading={loading}
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

"use client";

import { useState, useCallback } from "react";
import WelcomePhase from "@/components/phases/WelcomePhase";
import DescribePhase from "@/components/phases/DescribePhase";
import ComparablesPhase from "@/components/phases/ComparablesPhase";
import AnalyticsPhase from "@/components/phases/AnalyticsPhase";
import {
  ANALYSIS_INSUFFICIENT,
  ANALYSIS_SUFFICIENT,
  type AnalysisResponse,
} from "@/lib/mock-data";

export type Phase = "landing" | "describe" | "comparables" | "analytics";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [similarGames, setSimilarGames] = useState<string[]>([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [analyzeCount, setAnalyzeCount] = useState(0);

  const goTo = useCallback((p: Phase) => setPhase(p), []);

  const startNewSession = useCallback(() => {
    setPhase("landing");
    setDescription("");
    setGenres([]);
    setSimilarGames([]);
    setAnalyzed(false);
    setQuestions([]);
    setAnalyzeCount(0);
  }, []);

  const handleImport = useCallback((data: Record<string, unknown>) => {
    if (typeof data.description === "string") setDescription(data.description);
    if (Array.isArray(data.genres)) setGenres(data.genres as string[]);
    if (Array.isArray(data.similarGames)) setSimilarGames(data.similarGames as string[]);
    if (data.description || data.genres || data.similarGames) setAnalyzed(true);
    setPhase("describe");
  }, []);

  const handleAnalyze = useCallback((): Promise<AnalysisResponse> => {
    // Simulate user-game-analyzer service with diff logic:
    // First call: not enough info → ask questions
    // Second call: enough info → populate Section 2
    return new Promise((resolve) => {
      setTimeout(() => {
        const count = analyzeCount + 1;
        setAnalyzeCount(count);

        let response: AnalysisResponse;
        if (count === 1 && description.length < 150) {
          response = ANALYSIS_INSUFFICIENT;
          setQuestions(response.questions);
        } else {
          response = ANALYSIS_SUFFICIENT;
          setQuestions([]);
          setAnalyzed(true);
          // Auto-populate genres and similar games from analysis
          setGenres((prev) => {
            const merged = new Set([...prev, ...response.genres]);
            return [...merged];
          });
          setSimilarGames((prev) => {
            const merged = new Set([...prev, ...response.suggestedGames]);
            return [...merged];
          });
        }
        resolve(response);
      }, 1200);
    });
  }, [analyzeCount, description.length]);

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
        onNext={() => goTo("comparables")}
        onStartNewSession={startNewSession}
      />
    );
  }

  if (phase === "comparables") {
    return (
      <ComparablesPhase
        onNext={() => goTo("analytics")}
        onBack={() => goTo("describe")}
        onStartNewSession={startNewSession}
      />
    );
  }

  return <AnalyticsPhase onStartNewSession={startNewSession} />;
}

"use client";

import { useState, useCallback } from "react";
import WelcomePhase from "@/components/phases/WelcomePhase";
import DescribePhase from "@/components/phases/DescribePhase";
import ComparablesPhase from "@/components/phases/ComparablesPhase";
import AnalyticsPhase from "@/components/phases/AnalyticsPhase";

export type Phase = "landing" | "describe" | "comparables" | "analytics";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [similarGames, setSimilarGames] = useState<string[]>([]);
  const [analyzed, setAnalyzed] = useState(false);

  const goTo = useCallback((p: Phase) => setPhase(p), []);

  const startNewSession = useCallback(() => {
    setPhase("landing");
    setDescription("");
    setGenres([]);
    setSimilarGames([]);
    setAnalyzed(false);
  }, []);

  const handleImport = useCallback((data: Record<string, unknown>) => {
    // Populate state from imported data
    if (typeof data.description === "string") setDescription(data.description);
    if (Array.isArray(data.genres)) setGenres(data.genres as string[]);
    if (Array.isArray(data.similarGames)) setSimilarGames(data.similarGames as string[]);
    if (data.description || data.genres || data.similarGames) setAnalyzed(true);
    setPhase("describe");
  }, []);

  const handleAnalyze = useCallback(() => {
    // In future: send to user-game-analyzer service with diff logic
    // For now, just mark as analyzed to reveal Section 2
    setAnalyzed(true);
  }, []);

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

  return (
    <AnalyticsPhase onStartNewSession={startNewSession} />
  );
}

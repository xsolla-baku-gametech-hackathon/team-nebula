"use client";

import { useState, useCallback } from "react";
import WelcomePhase from "@/components/phases/WelcomePhase";
import DescribePhase from "@/components/phases/DescribePhase";
import ComparablesPhase from "@/components/phases/ComparablesPhase";
import LaunchWindowPhase from "@/components/phases/LaunchWindowPhase";

export type Phase = "landing" | "concept" | "comparables" | "forecast";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [similarGames, setSimilarGames] = useState<string[]>([]);

  const goTo = useCallback((p: Phase) => setPhase(p), []);

  if (phase === "landing") {
    return <WelcomePhase onStartScratch={() => goTo("concept")} onImport={() => goTo("concept")} />;
  }

  if (phase === "concept") {
    return (
      <DescribePhase
        description={description}
        onDescriptionChange={setDescription}
        genres={genres}
        onGenresChange={setGenres}
        similarGames={similarGames}
        onSimilarGamesChange={setSimilarGames}
        onNext={() => goTo("comparables")}
        onBack={() => goTo("landing")}
      />
    );
  }

  if (phase === "comparables") {
    return (
      <ComparablesPhase
        onNext={() => goTo("forecast")}
        onBack={() => goTo("concept")}
      />
    );
  }

  return (
    <LaunchWindowPhase
      onBack={() => goTo("comparables")}
      onStartOver={() => goTo("landing")}
    />
  );
}

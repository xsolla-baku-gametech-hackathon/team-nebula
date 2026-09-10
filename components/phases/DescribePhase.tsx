"use client";

import { useState } from "react";
import StepPills from "@/components/phases/StepPills";

interface Props {
  description: string;
  onDescriptionChange: (v: string) => void;
  genres: string[];
  onGenresChange: (v: string[]) => void;
  similarGames: string[];
  onSimilarGamesChange: (v: string[]) => void;
  analyzed: boolean;
  onAnalyze: () => void;
  onNext: () => void;
  onStartNewSession: () => void;
}

const GENRE_SUGGESTIONS = ["Survival", "Atmospheric", "Psychological Horror", "Co-op"];
const GAME_SUGGESTIONS = ["Barotrauma", "Lethal Company", "Subnautica", "Phasmophobia"];

export default function DescribePhase({
  description, onDescriptionChange,
  genres, onGenresChange,
  similarGames, onSimilarGamesChange,
  analyzed, onAnalyze,
  onNext, onStartNewSession,
}: Props) {
  const [genreInput, setGenreInput] = useState("");
  const [gameInput, setGameInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const addGenre = (tag: string) => { if (tag && !genres.includes(tag)) onGenresChange([...genres, tag]); };
  const removeGenre = (tag: string) => onGenresChange(genres.filter((g) => g !== tag));
  const addGame = (title: string) => { if (title && !similarGames.includes(title)) onSimilarGamesChange([...similarGames, title]); };
  const removeGame = (title: string) => onSimilarGamesChange(similarGames.filter((g) => g !== title));

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); onAnalyze(); }, 1200);
  };

  return (
    <div className="max-w-[720px] mx-auto px-8 py-8 relative">
      <StepPills active="describe" />

      <div className="flex flex-col gap-12">
        {/* Description */}
        <section>
          <h1 className="font-heading text-[32px] font-semibold text-white tracking-tight mb-1">Description</h1>
          <p className="text-[15px] text-on-surface-variant mb-4">Tell us about your game.</p>

          <div className="rounded-2xl bg-[#D9D9DE]/90 shadow-lg border-t border-white/70 overflow-hidden">
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full h-[220px] p-5 bg-transparent resize-none font-heading text-[18px] text-[#1E1E2A] placeholder:text-[#1E1E2A]/40 focus:outline-none leading-relaxed"
              placeholder="Describe the moment-to-moment gameplay. What does the player actually do?"
            />
            <div className="px-5 py-2.5 bg-black/5 text-right text-[12px] text-[#6E6E7C] font-mono">
              {description.length} chars
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleAnalyze}
              disabled={description.trim().length < 20 || analyzing}
              className="px-5 py-2.5 rounded-xl bg-primary-container hover:bg-inverse-primary text-white font-heading text-[15px] font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <><span className="animate-spin">&#9696;</span> Analyzing...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">{analyzed ? "refresh" : "psychology"}</span> {analyzed ? "Update" : "Analyze"}</>
              )}
            </button>
          </div>
        </section>

        {/* Genres + Similar Games — only after analysis */}
        {analyzed && (
          <>
            <section>
              <h2 className="font-heading text-[32px] font-semibold text-white tracking-tight mb-1">Genres</h2>
              <p className="text-[15px] text-on-surface-variant mb-4">What are the genres of your game?</p>

              <div className="flex flex-col gap-2">
                {genres.map((g) => (
                  <div key={g} className="h-[44px] rounded-xl bg-[#D9D9DE] px-4 flex items-center justify-between shadow-sm">
                    <span className="font-heading text-[16px] font-semibold text-[#1E1E2A]">{g}</span>
                    <button onClick={() => removeGenre(g)} className="text-[#1E1E2A]/50 hover:text-[#1E1E2A]">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <input
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && genreInput.trim()) { addGenre(genreInput.trim()); setGenreInput(""); } }}
                  className="flex-1 h-[44px] px-4 rounded-xl bg-[#D9D9DE]/90 text-[#1E1E2A] placeholder:text-[#1E1E2A]/40 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary-container"
                  placeholder="Add a genre..."
                />
                <button onClick={() => { if (genreInput.trim()) { addGenre(genreInput.trim()); setGenreInput(""); } }} className="h-[44px] px-4 rounded-xl bg-[#D9D9DE] font-heading text-[18px] font-semibold text-[#1E1E2A] hover:bg-white transition-colors">+</button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {GENRE_SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => addGenre(s)} className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface-variant text-[12px] hover:text-on-surface transition-colors">+ {s}</button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-heading text-[32px] font-semibold text-white tracking-tight mb-1">Similar games</h2>
              <p className="text-[15px] text-on-surface-variant mb-4">What games feel like yours? <span className="text-primary text-[13px]">(optional)</span></p>

              <div className="flex flex-col gap-2">
                {similarGames.map((g) => (
                  <div key={g} className="h-[44px] rounded-xl bg-[#D9D9DE] px-4 flex items-center justify-between shadow-sm">
                    <span className="font-heading text-[16px] font-semibold text-[#1E1E2A]">{g}</span>
                    <button onClick={() => removeGame(g)} className="text-[#1E1E2A]/50 hover:text-[#1E1E2A]">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <input
                  value={gameInput}
                  onChange={(e) => setGameInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && gameInput.trim()) { addGame(gameInput.trim()); setGameInput(""); } }}
                  className="flex-1 h-[44px] px-4 rounded-xl bg-[#D9D9DE]/90 text-[#1E1E2A] placeholder:text-[#1E1E2A]/40 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary-container"
                  placeholder="Search for a game..."
                />
                <button onClick={() => { if (gameInput.trim()) { addGame(gameInput.trim()); setGameInput(""); } }} className="h-[44px] px-4 rounded-xl bg-[#D9D9DE] font-heading text-[18px] font-semibold text-[#1E1E2A] hover:bg-white transition-colors">+</button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {GAME_SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => addGame(s)} className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface-variant text-[12px] hover:text-on-surface transition-colors">+ {s}</button>
                ))}
              </div>
            </section>

            {/* Proceed */}
            <div className="flex justify-end">
              <button onClick={onNext} className="px-6 py-3 rounded-xl bg-primary-container hover:bg-inverse-primary text-white font-heading text-[16px] font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95">
                Find comparables <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Start new session */}
      <div className="flex justify-center mt-16">
        <button onClick={onStartNewSession} className="text-on-surface-variant hover:text-on-surface text-[13px] transition-colors flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          Start new session
        </button>
      </div>
    </div>
  );
}

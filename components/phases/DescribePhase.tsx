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
  onNext: () => void;
  onBack: () => void;
}

const GENRE_SUGGESTIONS = ["Survival", "Atmospheric", "Psychological Horror", "Co-op"];
const GAME_SUGGESTIONS = ["Barotrauma", "Lethal Company", "Subnautica", "Phasmophobia"];

export default function DescribePhase({
  description, onDescriptionChange,
  genres, onGenresChange,
  similarGames, onSimilarGamesChange,
  onNext, onBack,
}: Props) {
  const [genreInput, setGenreInput] = useState("");
  const [gameInput, setGameInput] = useState("");

  const addGenre = (tag: string) => {
    if (tag && !genres.includes(tag)) onGenresChange([...genres, tag]);
  };
  const removeGenre = (tag: string) => onGenresChange(genres.filter((g) => g !== tag));
  const addGame = (title: string) => {
    if (title && !similarGames.includes(title)) onSimilarGamesChange([...similarGames, title]);
  };
  const removeGame = (title: string) => onSimilarGamesChange(similarGames.filter((g) => g !== title));

  return (
    <div className="max-w-[1440px] mx-auto px-12 py-8">
      <div className="flex flex-col w-full relative">
        {/* Ambient glow */}
        <div className="fixed top-1/3 -right-48 w-[720px] h-[720px] rounded-full pointer-events-none z-0 opacity-40 blur-3xl bg-[radial-gradient(circle,#2E3FD8_0%,#8FA0F0_45%,transparent_70%)]" />
        <div className="fixed top-1/4 right-32 w-72 h-72 rounded-full pointer-events-none z-0 opacity-15 blur-2xl bg-primary" />

        {/* Right vertical rail navigation */}
        <aside className="fixed right-[calc(50%-490px)] top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center">
          <div className="relative flex flex-col items-center gap-[80px]">
            <div className="absolute top-2 bottom-2 w-[1px] bg-white/20 -z-10" />
            <a href="#section-description" className="group flex items-center justify-center p-2">
              <span className="w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.85)] ring-4 ring-white/20 transition-all duration-300 scale-110" />
            </a>
            <a href="#section-genres" className="group flex items-center justify-center p-2">
              <span className="w-4 h-4 rounded-full bg-transparent border-2 border-white/60 hover:border-white transition-all duration-300" />
            </a>
            <a href="#section-similar" className="group flex items-center justify-center p-2">
              <span className="w-4 h-4 rounded-full bg-transparent border-2 border-white/60 hover:border-white transition-all duration-300" />
            </a>
          </div>
        </aside>

        {/* Step pills */}
        <StepPills active="describe" />

        {/* Content */}
        <div className="w-full max-w-[710px] mx-auto xl:ml-[260px] pb-36 flex flex-col gap-[120px] relative z-10">
          {/* SECTION 1: Description */}
          <section id="section-description" className="scroll-mt-40 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <h1 className="font-heading text-[40px] font-semibold text-white tracking-tight leading-[48px]">Description</h1>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#14141F] text-white font-mono text-[10px] font-medium uppercase tracking-wider leading-[12px]">
                  <span className="material-symbols-outlined text-[12px] text-primary">psychology</span>
                  FACT &middot; Steam Input
                </div>
              </div>
              <p className="text-[16px] text-[#A9A9B8] leading-[24px] tracking-tight">Tell us about your idea.</p>
            </div>
            <div className="relative w-full rounded-2xl bg-[#D9D9DE]/90 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.35)] border-t border-white/70 overflow-hidden">
              <div className="p-6">
                <textarea
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  className="w-full h-[280px] bg-transparent resize-none font-heading text-[20px] text-[#1E1E2A] placeholder:text-[#1E1E2A]/50 focus:outline-none leading-relaxed tracking-normal"
                  placeholder="Describe the moment-to-moment gameplay, not the genre. What does the player actually do?"
                />
              </div>
              <div className="px-6 py-3.5 bg-black/5 flex items-center justify-between font-mono text-[11px] font-semibold text-[#6E6E7C] uppercase tracking-wider leading-[14px]">
                <span>SYNTACTIC TOKEN DENSITY: {description.length > 50 ? "OPTIMAL" : "LOW"}</span>
                <span>{description.length} CHARACTERS &middot; {description.length >= 20 ? "MODEL READY" : "MINIMUM 20"}</span>
              </div>
            </div>
          </section>

          {/* SECTION 2: Genres */}
          <section id="section-genres" className="scroll-mt-40 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-[40px] font-semibold text-white tracking-tight leading-[48px]">Genres</h2>
                <span className="font-mono text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider leading-[14px]">TAXONOMY CLUSTER</span>
              </div>
              <p className="text-[16px] text-[#A9A9B8] leading-[24px] tracking-tight">What are the genres of your game?</p>
            </div>

            {/* Selected genres */}
            <div className="flex flex-col gap-2.5">
              {genres.map((genre) => (
                <div key={genre} className="w-full h-[52px] rounded-xl bg-[#D9D9DE] px-5 flex items-center justify-between border-t border-white/70 shadow-sm transition-transform hover:-translate-y-0.5">
                  <span className="font-heading text-[20px] font-semibold text-[#1E1E2A] leading-[28px] tracking-tight">{genre}</span>
                  <button onClick={() => removeGenre(genre)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1E1E2A]/70 hover:text-[#1E1E2A] hover:bg-black/5 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Add genre */}
            <div className="flex items-start gap-3 mt-1">
              <button
                onClick={() => { if (genreInput.trim()) { addGenre(genreInput.trim()); setGenreInput(""); } }}
                className="w-[52px] h-[52px] shrink-0 rounded-xl bg-[#D9D9DE] border-t border-white/70 shadow-md flex items-center justify-center font-heading text-[28px] font-semibold text-[#1E1E2A] hover:bg-white transition-all active:scale-95"
              >
                +
              </button>
              <div className="w-[645px] rounded-xl bg-[#D9D9DE]/90 backdrop-blur-xl p-4 flex flex-col gap-4 border-t border-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.30)]">
                <div className="relative w-full">
                  <input
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && genreInput.trim()) { addGenre(genreInput.trim()); setGenreInput(""); } }}
                    className="w-full h-11 px-4 rounded-xl bg-white/90 text-[#1E1E2A] placeholder:text-[#1E1E2A]/50 text-[14px] italic border-2 border-transparent focus:border-primary-container focus:outline-none transition-all"
                    placeholder="Search Steam genre tags..."
                  />
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#1E1E2A]/40 pointer-events-none">search</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[11px] font-semibold text-[#6E6E7C] uppercase tracking-wider leading-[14px]">COMMON STEAM TAXONOMY SUGGESTIONS</span>
                  <div className="flex flex-wrap gap-2">
                    {GENRE_SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => addGenre(s)} className="px-3 py-1 rounded-lg bg-black/5 hover:bg-black/10 text-[#1E1E2A] text-[12px] transition-colors">
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: Similar Games */}
          <section id="section-similar" className="scroll-mt-40 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-[40px] font-semibold text-white tracking-tight leading-[48px]">Similar games</h2>
                <span className="px-2.5 py-1 rounded-full bg-surface-container font-mono text-[10px] font-medium text-primary tracking-wider uppercase leading-[12px]">COLLISION REFERENCE</span>
              </div>
              <p className="text-[16px] text-[#A9A9B8] leading-[24px] tracking-tight">What games feel like yours?</p>
            </div>

            {/* Selected games */}
            <div className="flex flex-col gap-2.5">
              {similarGames.map((game) => (
                <div key={game} className="w-full h-[52px] rounded-xl bg-[#D9D9DE] px-5 flex items-center justify-between border-t border-white/70 shadow-sm transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-secondary-container" />
                    <span className="font-heading text-[20px] font-semibold text-[#1E1E2A] leading-[28px] tracking-tight">{game}</span>
                  </div>
                  <button onClick={() => removeGame(game)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1E1E2A]/70 hover:text-[#1E1E2A] hover:bg-black/5 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Add game */}
            <div className="flex items-start gap-3 mt-1">
              <button
                onClick={() => { if (gameInput.trim()) { addGame(gameInput.trim()); setGameInput(""); } }}
                className="w-[52px] h-[52px] shrink-0 rounded-xl bg-[#D9D9DE] border-t border-white/70 shadow-md flex items-center justify-center font-heading text-[28px] font-semibold text-[#1E1E2A] hover:bg-white transition-all active:scale-95"
              >
                +
              </button>
              <div className="w-[645px] rounded-xl bg-[#D9D9DE]/90 backdrop-blur-xl p-4 flex flex-col gap-4 border-t border-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.30)]">
                <div className="relative w-full">
                  <input
                    value={gameInput}
                    onChange={(e) => setGameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && gameInput.trim()) { addGame(gameInput.trim()); setGameInput(""); } }}
                    className="w-full h-11 px-4 rounded-xl bg-white/90 text-[#1E1E2A] placeholder:text-[#1E1E2A]/50 text-[14px] italic border-2 border-transparent focus:border-primary-container focus:outline-none transition-all"
                    placeholder="Search Steam AppID or title..."
                  />
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#1E1E2A]/40 pointer-events-none">sports_esports</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[11px] font-semibold text-[#6E6E7C] uppercase tracking-wider leading-[14px]">RECENT VALVE STORE CO-OCCURRENCES</span>
                  <div className="flex flex-wrap gap-2">
                    {GAME_SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => addGame(s)} className="px-3 py-1 rounded-lg bg-black/5 hover:bg-black/10 text-[#1E1E2A] text-[12px] transition-colors">
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[14px] text-[#A9A9B8] mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">info</span>
              Optional — we&apos;ll find comparables from your description either way.
            </p>
          </section>
        </div>

        {/* Sticky CTA */}
        <aside className="fixed bottom-8 right-8 z-50">
          <button
            onClick={onNext}
            disabled={description.trim().length < 20}
            className="w-[210px] h-[64px] rounded-xl bg-primary-container hover:bg-inverse-primary text-white font-heading text-[20px] font-semibold tracking-tight flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(107,127,215,0.45)] transition-all duration-200 active:scale-95 group disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Find comparables</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import StepPills from "@/components/phases/StepPills";
import { GENRE_SUGGESTIONS, GAME_SUGGESTIONS } from "@/lib/mock-data";

interface Props {
  description: string;
  onDescriptionChange: (v: string) => void;
  genres: string[];
  onGenresChange: (v: string[]) => void;
  similarGames: string[];
  onSimilarGamesChange: (v: string[]) => void;
  analyzed: boolean;
  questions: string[];
  onAnalyze: () => Promise<void>;
  onNext: () => void;
  onStartNewSession: () => void;
  loading?: boolean;
}

function TagList({ items, onRemove }: { items: string[]; onRemove: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <div key={item} className="h-9 rounded-lg bg-surface-container-highest px-3 flex items-center justify-between group">
          <span className="text-[14px] text-on-surface">{item}</span>
          <button onClick={() => onRemove(item)} className="text-on-surface-variant/40 hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}

function AddInput({ value, onChange, onAdd, placeholder }: { value: string; onChange: (v: string) => void; onAdd: () => void; placeholder: string }) {
  return (
    <div className="flex gap-1.5 mt-1.5">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onAdd(); }}
        className="flex-1 h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-on-surface-variant/40 text-[13px] border border-outline-variant/20 focus:outline-none focus:border-primary/50"
        placeholder={placeholder}
      />
      <button onClick={onAdd} className="h-9 w-9 rounded-lg bg-surface-container-highest border border-outline-variant/20 text-on-surface-variant hover:text-on-surface flex items-center justify-center">
        <span className="material-symbols-outlined text-[18px]">add</span>
      </button>
    </div>
  );
}

function Suggestions({ items, onAdd }: { items: string[]; onAdd: (v: string) => void }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {items.map((s) => (
        <button key={s} onClick={() => onAdd(s)} className="px-2 py-0.5 rounded-md text-[11px] text-on-surface-variant hover:text-primary border border-outline-variant/20 hover:border-primary/30 transition-colors">
          + {s}
        </button>
      ))}
    </div>
  );
}

export default function DescribePhase({
  description, onDescriptionChange,
  genres, onGenresChange,
  similarGames, onSimilarGamesChange,
  analyzed, questions,
  onAnalyze, onNext, onStartNewSession, loading,
}: Props) {
  const [genreInput, setGenreInput] = useState("");
  const [gameInput, setGameInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const addGenre = (t: string) => { if (t && !genres.includes(t)) onGenresChange([...genres, t]); };
  const addGame = (t: string) => { if (t && !similarGames.includes(t)) onSimilarGamesChange([...similarGames, t]); };

  const handleAnalyze = async () => { setAnalyzing(true); await onAnalyze(); setAnalyzing(false); };

  const appendAnswers = () => {
    const filled = Object.entries(answers).filter(([, v]) => v.trim()).map(([i, v]) => `${questions[Number(i)]}: ${v.trim()}`).join("\n");
    if (filled) { onDescriptionChange(description + "\n\n" + filled); setAnswers({}); }
  };

  const hasAnswers = Object.values(answers).some((v) => v.trim());

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-5">
      <StepPills active="describe" />

      <div className={analyzed ? "grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start" : "max-w-[720px]"}>
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          {/* Description */}
          <div>
            <h2 className="text-[14px] font-semibold text-on-surface mb-2 uppercase tracking-wide">Description</h2>
            <div className="rounded-xl bg-surface-container border border-outline-variant/20 overflow-hidden">
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                className="w-full h-[140px] p-4 bg-transparent resize-none text-[15px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none leading-relaxed"
                placeholder="Describe the moment-to-moment gameplay. What does the player actually do?"
              />
              <div className="px-4 py-2 border-t border-outline-variant/10 flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant font-mono">{description.length} chars</span>
                <button
                  onClick={handleAnalyze}
                  disabled={description.trim().length < 20 || analyzing}
                  className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-[13px] font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-all disabled:opacity-30"
                >
                  {analyzing ? "Analyzing..." : analyzed ? "Re-analyze" : "Analyze"}
                </button>
              </div>
            </div>
          </div>

          {/* Questions */}
          {questions.length > 0 && (
            <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4">
              <p className="text-[13px] font-semibold text-on-surface mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[16px]">help</span>
                Follow-up questions
              </p>
              <div className="flex flex-col gap-2.5">
                {questions.map((q, i) => (
                  <div key={i}>
                    <label className="text-[12px] text-on-surface-variant mb-1 block">{q}</label>
                    <input
                      value={answers[i] ?? ""}
                      onChange={(e) => setAnswers((p) => ({ ...p, [i]: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface text-[13px] border border-outline-variant/20 focus:outline-none focus:border-primary/50 placeholder:text-on-surface-variant/30"
                      placeholder="Type your answer..."
                    />
                  </div>
                ))}
              </div>
              {hasAnswers && (
                <button onClick={appendAnswers} className="mt-3 px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-[13px] font-medium hover:bg-primary/20 transition-colors flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  Append answers to description
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Genres + Similar Games */}
        {analyzed && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-[14px] font-semibold text-on-surface mb-2 uppercase tracking-wide">Genres</h2>
              <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-3">
                <TagList items={genres} onRemove={(g) => onGenresChange(genres.filter((x) => x !== g))} />
                <AddInput value={genreInput} onChange={setGenreInput} onAdd={() => { if (genreInput.trim()) { addGenre(genreInput.trim()); setGenreInput(""); } }} placeholder="Add genre..." />
                <Suggestions items={GENRE_SUGGESTIONS.filter((s) => !genres.includes(s))} onAdd={addGenre} />
              </div>
            </div>

            <div>
              <h2 className="text-[14px] font-semibold text-on-surface mb-2 uppercase tracking-wide">Similar Games</h2>
              <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-3">
                <TagList items={similarGames} onRemove={(g) => onSimilarGamesChange(similarGames.filter((x) => x !== g))} />
                <AddInput value={gameInput} onChange={setGameInput} onAdd={() => { if (gameInput.trim()) { addGame(gameInput.trim()); setGameInput(""); } }} placeholder="Search for a game..." />
                <Suggestions items={GAME_SUGGESTIONS.filter((s) => !similarGames.includes(s))} onAdd={addGame} />
              </div>
            </div>

            <button onClick={onNext} className="w-full h-11 rounded-xl bg-primary text-on-primary font-heading text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              Find comparables <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-10">
        <button onClick={onStartNewSession} className="text-on-surface-variant hover:text-on-surface text-[12px] transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">restart_alt</span> New session
        </button>
      </div>
    </div>
  );
}

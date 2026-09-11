"use client";

import { useState } from "react";
import { ArrowRight, BrainCircuit, CircleDollarSign, CircleHelp, Gamepad2, Plus, RotateCcw, UsersRound, X } from "lucide-react";
import StepPills, { type Step } from "@/components/phases/StepPills";
import { ProcessIndicator } from "@/components/shared/ProcessIndicator";
import { GENRE_SUGGESTIONS } from "@/lib/mock-data";
import type {
  DiscoveryCandidate,
  DiscoveryValidation,
} from "@/lib/api/client";

interface Props {
  description: string;
  onDescriptionChange: (value: string) => void;
  genres: string[];
  onGenresChange: (genres: string[]) => void;
  validation: DiscoveryValidation | null;
  candidates: DiscoveryCandidate[];
  selectedSteamAppIds: number[];
  questions: string[];
  error: string | null;
  stage: "idle" | "validating" | "collecting";
  onAnalyze: (clarifications: { question: string; answer: string }[]) => Promise<void>;
  onToggleCandidate: (steamAppId: number) => void;
  onSelectAllCandidates: () => void;
  onApprove: () => Promise<void>;
  onStartNewSession: () => void;
  hasCollectedResults: boolean;
  unlockedSteps: Step[];
  onNavigate: (step: Step) => void;
  onViewCollectedResults: () => void;
}

function TagList({ items, onRemove }: { items: string[]; onRemove: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <div key={item} className="h-9 rounded-lg bg-surface-container-highest px-3 flex items-center justify-between group">
          <span className="text-[14px] text-on-surface">{item}</span>
          <button
            type="button"
            aria-label={`Remove ${item}`}
            onClick={() => onRemove(item)}
            className="text-on-surface-variant/40 hover:text-on-surface opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

function AddInput({
  value,
  onChange,
  onAdd,
}: {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex gap-1.5 mt-1.5">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onAdd();
        }}
        className="flex-1 h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface placeholder:text-on-surface-variant/40 text-[13px] border border-outline-variant/20 focus:outline-none focus:border-primary/50"
        placeholder="Add a genre or gameplay tag..."
      />
      <button
        type="button"
        aria-label="Add genre or gameplay tag"
        onClick={onAdd}
        className="h-9 w-9 rounded-lg bg-surface-container-highest border border-outline-variant/20 text-on-surface-variant hover:text-on-surface flex items-center justify-center"
      >
        <Plus size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

function ValidationPanel({ validation }: { validation: DiscoveryValidation }) {
  return (
    <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[13px] font-semibold text-on-surface flex items-center gap-1.5">
          <BrainCircuit size={16} className="text-primary" aria-hidden="true" />
          Concept interpretation
        </p>
        <span className="text-[11px] text-primary font-mono">
          {Math.round(validation.confidence * 100)}% confidence
        </span>
      </div>
      <p className="text-[12px] text-on-surface-variant leading-relaxed mb-3">
        {validation.normalizedDescription}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {validation.tags.map((tag) => (
          <span
            key={tag.name.toLocaleLowerCase()}
            title={`${tag.category} · ${tag.priority} · ${tag.basis}`}
            className={`px-2 py-1 rounded-md text-[10px] font-mono border ${
              tag.priority === "required"
                ? "text-primary border-primary/30 bg-primary/10"
                : "text-on-surface-variant border-outline-variant/20"
            }`}
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function CandidateReview({
  candidates,
  selectedSteamAppIds,
  collecting,
  onToggle,
  onSelectAll,
  onApprove,
}: {
  candidates: DiscoveryCandidate[];
  selectedSteamAppIds: number[];
  collecting: boolean;
  onToggle: (steamAppId: number) => void;
  onSelectAll: () => void;
  onApprove: () => Promise<void>;
}) {
  const selected = new Set(selectedSteamAppIds);
  const allSelected = selected.size === candidates.length;

  return (
    <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-[14px] font-semibold text-on-surface">Review comparable names</h2>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            Approve the games before live prices, revenue, sales, and reviews are collected.
          </p>
        </div>
        <button
          type="button"
          onClick={onSelectAll}
          className="text-[11px] text-primary hover:underline shrink-0"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-[430px] overflow-y-auto pr-1">
        {candidates.map((candidate) => (
          <label
            key={candidate.steamAppId}
            className={`rounded-lg border p-3 cursor-pointer transition-colors ${
              selected.has(candidate.steamAppId)
                ? "border-primary/40 bg-primary/5"
                : "border-outline-variant/20 bg-surface-container-highest/40"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                checked={selected.has(candidate.steamAppId)}
                onChange={() => onToggle(candidate.steamAppId)}
                className="mt-1 accent-primary"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-on-surface">{candidate.name}</p>
                <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
                  {candidate.reason}
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {candidate.matchedTags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] text-primary border border-primary/20 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={onApprove}
        disabled={collecting || selected.size === 0}
        className="w-full h-11 mt-4 rounded-xl bg-primary text-on-primary font-heading text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        {collecting
          ? "Collecting live game data..."
          : `Collect details for ${selected.size} game${selected.size === 1 ? "" : "s"}`}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function DescribePhase({
  description,
  onDescriptionChange,
  genres,
  onGenresChange,
  validation,
  candidates,
  selectedSteamAppIds,
  questions,
  error,
  stage,
  onAnalyze,
  onToggleCandidate,
  onSelectAllCandidates,
  onApprove,
  onStartNewSession,
  hasCollectedResults,
  unlockedSteps,
  onNavigate,
  onViewCollectedResults,
}: Props) {
  const [genreInput, setGenreInput] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const addGenre = (tag: string) => {
    if (tag && !genres.includes(tag)) onGenresChange([...genres, tag]);
  };

  const handleAnalyze = async () => {
    const clarifications = questions.flatMap((question, index) => {
      const answer = answers[index]?.trim();
      return answer ? [{ question, answer }] : [];
    });
    await onAnalyze(clarifications);
  };

  const hasAnsweredQuestion = Object.values(answers).some((answer) => answer.trim());
  const validating = stage === "validating";

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <StepPills active="describe" unlocked={unlockedSteps} onNavigate={onNavigate} />

      <div className="mb-7 max-w-[680px]">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Concept intake</p>
        <h1 className="mt-2 font-heading text-[30px] font-semibold tracking-[-0.04em] text-on-surface">Frame the game and its commercial context.</h1>
        <p className="mt-2 text-[13px] leading-6 text-on-surface-variant">
          Describe what players do, who they play with, and what makes the concept distinct. You will review the interpreted concept and every comparable before analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface">Game description</h2>
              <span className="font-mono text-[10px] text-on-surface-variant">{description.length} characters</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container shadow-[0_18px_55px_rgba(0,0,0,0.12)] focus-within:border-primary/45">
              <textarea
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                className="h-[210px] w-full resize-none bg-transparent p-5 text-[15px] leading-7 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
                placeholder="Example: A four-player survival horror game where crews investigate abandoned orbital stations, recover salvage, and escape an adaptive creature. Sessions last 30–45 minutes with proximity voice chat and persistent ship upgrades."
              />
              <div className="flex items-center justify-between border-t border-outline-variant/15 px-4 py-3">
                <span className="text-[11px] text-on-surface-variant">No market search begins before validation.</span>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={description.trim().length < 20 || validating || stage === "collecting"}
                  className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-on-primary transition-all hover:bg-primary/90 disabled:opacity-30"
                >
                  {validating
                    ? "Checking concept..."
                    : questions.length && hasAnsweredQuestion
                      ? "Validate answers"
                      : validation
                        ? "Validate again"
                        : "Validate concept"}
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div role="alert" className="rounded-xl border border-red/30 bg-red/10 px-4 py-3 text-[13px] text-red">
              {error}
            </div>
          ) : null}

          {stage !== "idle" ? (
            <ProcessIndicator kind={stage === "collecting" ? "collection" : "discovery"} />
          ) : null}

          {questions.length > 0 ? (
            <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-4">
              <p className="text-[13px] font-semibold text-on-surface mb-1 flex items-center gap-1.5">
                <CircleHelp size={16} className="text-primary" aria-hidden="true" />
                A few details will improve the comparable search
              </p>
              <p className="text-[11px] text-on-surface-variant mb-3">
                Answer what you can, then check the concept again. No games have been searched yet.
              </p>
              <div className="flex flex-col gap-2.5">
                {questions.map((question, index) => (
                  <div key={question}>
                    <label htmlFor={`discovery-answer-${index}`} className="text-[12px] text-on-surface-variant mb-1 block">
                      {question}
                    </label>
                    <input
                      id={`discovery-answer-${index}`}
                      value={answers[index] ?? ""}
                      onChange={(event) => setAnswers((previous) => ({ ...previous, [index]: event.target.value }))}
                      className="w-full h-9 px-3 rounded-lg bg-surface-container-highest text-on-surface text-[13px] border border-outline-variant/20 focus:outline-none focus:border-primary/50 placeholder:text-on-surface-variant/30"
                      placeholder="Type your answer..."
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {validation ? <ValidationPanel validation={validation} /> : null}

          <div>
            <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface">Optional market signals</h2>
            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-4">
              <TagList items={genres} onRemove={(genre) => onGenresChange(genres.filter((item) => item !== genre))} />
              <AddInput
                value={genreInput}
                onChange={setGenreInput}
                onAdd={() => {
                  if (!genreInput.trim()) return;
                  addGenre(genreInput.trim());
                  setGenreInput("");
                }}
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {GENRE_SUGGESTIONS.filter((suggestion) => !genres.includes(suggestion)).map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => addGenre(suggestion)}
                    className="px-2 py-0.5 rounded-md text-[11px] text-on-surface-variant hover:text-primary border border-outline-variant/20 hover:border-primary/30 transition-colors"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {validation ? (
          <div className="flex flex-col gap-4">
            {candidates.length > 0 ? (
              <CandidateReview
                candidates={candidates}
                selectedSteamAppIds={selectedSteamAppIds}
                collecting={stage === "collecting"}
                onToggle={onToggleCandidate}
                onSelectAll={onSelectAllCandidates}
                onApprove={onApprove}
              />
            ) : hasCollectedResults ? (
              <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-5">
                <p className="text-[13px] font-semibold text-on-surface">Live game details are already collected.</p>
                <p className="text-[11px] text-on-surface-variant mt-1 mb-4">
                  Open Comparables to review the retained results, or edit the description and validate again.
                </p>
                <button
                  type="button"
                  onClick={onViewCollectedResults}
                  className="w-full h-10 rounded-lg bg-primary text-on-primary text-[13px] font-semibold"
                >
                  View collected results
                </button>
              </div>
            ) : validation.status === "ready" && !validating ? (
              <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-5 text-[13px] text-on-surface-variant">
                No verified Steam matches were returned. Add a more specific gameplay or theme detail and validate again.
              </div>
            ) : null}
          </div>
        ) : (
          <aside className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-secondary">Strong inputs include</p>
            <div className="mt-5 space-y-5">
              {[
                { icon: Gamepad2, title: "The player loop", body: "Actions, session structure, progression, and what creates repeat play." },
                { icon: UsersRound, title: "Audience and mode", body: "Solo, co-op, PvP, perspective, tone, and intended player profile." },
                { icon: CircleDollarSign, title: "Commercial assumptions", body: "Target price, launch timing, and any positioning constraints you already know." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 border-b border-outline-variant/20 pb-5 last:border-0 last:pb-0">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/8 text-primary"><item.icon size={16} /></span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-on-surface">{item.title}</h3>
                    <p className="mt-1 text-[11px] leading-5 text-on-surface-variant">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>

      <div className="flex justify-center mt-10">
        <button
          type="button"
          onClick={onStartNewSession}
          className="text-on-surface-variant hover:text-on-surface text-[12px] transition-colors flex items-center gap-1"
        >
          <RotateCcw size={14} aria-hidden="true" /> New session
        </button>
      </div>
    </div>
  );
}

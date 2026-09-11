"use client";

import { useState } from "react";
import { ArrowRight, BrainCircuit, CircleHelp, Plus, RotateCcw, X } from "lucide-react";
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
    <div className="max-w-[1200px] mx-auto px-6 py-5">
      <StepPills active="describe" unlocked={unlockedSteps} onNavigate={onNavigate} />

      <div className={validation ? "grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-5 items-start" : "max-w-[720px]"}>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-[14px] font-semibold text-on-surface mb-2 uppercase tracking-wide">Description</h1>
            <div className="rounded-xl bg-surface-container border border-outline-variant/20 overflow-hidden">
              <textarea
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                className="w-full h-[140px] p-4 bg-transparent resize-none text-[15px] text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none leading-relaxed"
                placeholder="Describe the moment-to-moment gameplay. What does the player actually do?"
              />
              <div className="px-4 py-2 border-t border-outline-variant/10 flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant font-mono">{description.length} chars</span>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={description.trim().length < 20 || validating || stage === "collecting"}
                  className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-[13px] font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-all disabled:opacity-30"
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
            <p className="text-[11px] text-on-surface-variant mt-1.5">
              We structure your concept and confirm the search criteria before finding comparable games.
            </p>
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
            <h2 className="text-[14px] font-semibold text-on-surface mb-2 uppercase tracking-wide">Your extra tags</h2>
            <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-3">
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
        ) : null}
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

"use client";

import { useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  CircleHelp,
  Gamepad2,
  Plus,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import type { Step } from "@/components/shared/StepPills";
import { WorkspaceShell } from "@/components/shared/WorkspaceShell";
import { ProcessIndicator } from "@/components/shared/ProcessIndicator";
import { GENRE_SUGGESTIONS } from "@/components/concept/options";
import { isCanonicalTag } from "@/lib/domain/tag-vocabulary";
import type { DiscoveryCandidate, DiscoveryValidation } from "@/lib/api/client";

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
  notices: string[];
  stage: "idle" | "validating" | "collecting";
  onAnalyze: (
    clarifications: { question: string; answer: string }[],
  ) => Promise<void>;
  onToggleCandidate: (steamAppId: number) => void;
  onSelectAllCandidates: () => void;
  onApprove: () => Promise<void>;
  onStartNewSession: () => void;
  hasCollectedResults: boolean;
  unlockedSteps: Step[];
  onNavigate: (step: Step) => void;
  onViewCollectedResults: () => void;
}

const EXAMPLE =
  "A four-player survival horror game where crews investigate abandoned orbital stations, recover salvage, and escape an adaptive creature. Sessions last 30–45 minutes with proximity voice chat and persistent ship upgrades.";

function ValidationPanel({ validation }: { validation: DiscoveryValidation }) {
  return (
    <section className="ws-panel">
      <div className="ws-panel-head">
        <div>
          <h2 className="flex items-center gap-2">
            <BrainCircuit size={16} className="text-primary" /> Your concept,
            interpreted
          </h2>
          <p>Check that the search understands your game.</p>
        </div>
        <span className="ws-badge blue">
          {Math.round(validation.confidence * 100)}% confidence
        </span>
      </div>
      <div className="ws-panel-body">
        <p className="ws-muted text-[13px] leading-7 mb-5">
          {validation.normalizedDescription}
        </p>
        <div className="ws-tags">
          {validation.tags.map((tag) => (
            <span
              key={`${tag.category}-${tag.name.toLowerCase()}`}
              className={`ws-badge ${tag.priority === "required" ? "blue" : ""} ${isCanonicalTag(tag.name) ? "" : "border-dashed"}`}
              title={`${tag.category} · ${tag.priority} · ${tag.basis}${isCanonicalTag(tag.name) ? "" : " · free-form facet"}`}
            >
              {tag.priority === "required" ? <Check size={11} /> : null}
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </section>
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
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onApprove: () => Promise<void>;
}) {
  const selected = new Set(selectedSteamAppIds);
  return (
    <section className="ws-panel">
      <div className="ws-panel-head">
        <div>
          <h2>Your potential comparables</h2>
          <p>{candidates.length} games to review before collecting data.</p>
        </div>
        <span className="ws-badge blue">{selected.size} selected</span>
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--ws-border)]">
        <span className="text-[11px] ws-muted">
          Choose the games that belong in your market.
        </span>
        <button
          type="button"
          disabled={collecting}
          onClick={onSelectAll}
          className="ws-text-button shrink-0"
        >
          {selected.size === candidates.length ? "Clear all" : "Select all"}
        </button>
      </div>
      <div className="ws-candidate-list">
        {candidates.map((candidate) => (
          <label
            key={candidate.steamAppId}
            className={`ws-candidate ${selected.has(candidate.steamAppId) ? "is-selected" : ""}`}
          >
            <input
              type="checkbox"
              checked={selected.has(candidate.steamAppId)}
              disabled={collecting}
              onChange={() => onToggle(candidate.steamAppId)}
            />
            <div className="min-w-0">
              <strong>{candidate.name}</strong>
              <p>{candidate.reason}</p>
              <div className="ws-tags">
                {candidate.matchedTags.map((tag) => (
                  <span key={tag} className="ws-badge">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </label>
        ))}
      </div>
      <div className="ws-review-footer">
        <button
          type="button"
          className="ws-button"
          onClick={onApprove}
          disabled={collecting || selected.size === 0}
        >
          {collecting
            ? "Collecting game details…"
            : `Approve ${selected.size} game${selected.size === 1 ? "" : "s"}`}
          <ArrowRight size={15} />
        </button>
        <p className="ws-safety-note mt-3">
          <ShieldCheck size={15} className="shrink-0 mt-0.5" /> Live prices,
          reviews, and commercial estimates are collected after your approval.
        </p>
      </div>
    </section>
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
  notices,
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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const busy = stage !== "idle";
  const addGenre = (value: string) => {
    const tag = value.trim();
    if (
      tag &&
      !genres.some((genre) => genre.toLowerCase() === tag.toLowerCase())
    )
      onGenresChange([...genres, tag]);
  };
  const handleAnalyze = () =>
    onAnalyze(
      questions.flatMap((question) =>
        answers[question]?.trim()
          ? [{ question, answer: answers[question].trim() }]
          : [],
      ),
    );
  const hasAnswers = questions.some((question) => answers[question]?.trim());

  return (
    <WorkspaceShell
      active="describe"
      unlocked={unlockedSteps}
      onNavigate={onNavigate}
      onStartNewSession={onStartNewSession}
    >
      <header className="ws-page-heading">
        <div>
          <span className="ws-step-caption">Step 1 of 3</span>
          <h1>
            Every great launch starts
            <br className="hidden sm:block" /> with a clear game concept.
          </h1>
          <p>
            Tell us what players do. We’ll find the games that share your
            audience, then help you make a more informed launch decision.
          </p>
        </div>
        <span className="ws-badge">
          <ShieldCheck size={13} /> You approve every comparable
        </span>
      </header>
      {error ? (
        <div role="alert" className="ws-alert">
          <CircleHelp size={17} className="shrink-0 mt-0.5" />
          {error}
        </div>
      ) : null}
      {notices.length > 0 ? (
        <div role="status" className="ws-panel px-5 py-4 text-[12px] ws-muted mb-5">
          {notices.map((notice) => <p key={notice}>{notice}</p>)}
        </div>
      ) : null}
      <div className="ws-intake-grid">
        <div className="ws-stack">
          <section className="ws-panel">
            <div className="ws-panel-head">
              <div>
                <h2>
                  <label htmlFor="game-description">Describe your game</label>
                </h2>
                <p>
                  Player loop, setting, progression, and multiplayer experience.
                </p>
              </div>
              <Gamepad2 size={19} className="ws-muted shrink-0" />
            </div>
            <textarea
              id="game-description"
              className="ws-editor"
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="What does a player actually do in your game?

For example: A four-player horror game about scavenging abandoned orbital stations. Crews share resources, communicate through proximity chat, and upgrade their ship between short sessions."
              aria-describedby="description-hint"
            />
            <div className="ws-editor-bottom">
              <span id="description-hint">
                {description.trim().length < 20
                  ? "Add at least 20 characters to get started."
                  : `${description.length.toLocaleString()} characters`}
              </span>
              <button
                type="button"
                className="ws-button"
                disabled={description.trim().length < 20 || busy}
                onClick={handleAnalyze}
              >
                <Sparkles size={15} />
                {stage === "validating"
                  ? "Finding your market…"
                  : questions.length && hasAnswers
                    ? "Validate answers"
                    : validation
                      ? "Validate again"
                      : "Find comparable games"}
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
          {busy ? (
            <ProcessIndicator
              kind={stage === "collecting" ? "collection" : "discovery"}
            />
          ) : null}
          {questions.length ? (
            <section className="ws-panel">
              <div className="ws-panel-head">
                <div>
                  <h2 className="flex items-center gap-2">
                    <CircleHelp size={16} /> A little more context
                  </h2>
                  <p>
                    Answer these to refine the search. No games have been
                    searched yet.
                  </p>
                </div>
              </div>
              <div className="ws-panel-body ws-stack">
                {questions.map((question, index) => (
                  <label
                    className="ws-field"
                    key={question}
                    htmlFor={`discovery-answer-${index}`}
                  >
                    {question}
                    <input
                      id={`discovery-answer-${index}`}
                      className="ws-input"
                      value={answers[question] ?? ""}
                      onChange={(event) =>
                        setAnswers((previous) => ({
                          ...previous,
                          [question]: event.target.value,
                        }))
                      }
                      placeholder="Add a detail…"
                    />
                  </label>
                ))}
              </div>
            </section>
          ) : null}
          {validation ? <ValidationPanel validation={validation} /> : null}
          <section className="ws-panel">
            <div className="ws-panel-head">
              <div>
                <h2>Shape the search</h2>
                <p>
                  Optional genres and gameplay signals to add to your
                  description.
                </p>
              </div>
              <span className="ws-badge">Optional</span>
            </div>
            <div className="ws-panel-body">
              {genres.length ? (
                <div className="ws-tags mb-4">
                  {genres.map((genre) => (
                    <span className="ws-tag" key={genre}>
                      {genre}
                      <button
                        type="button"
                        aria-label={`Remove ${genre}`}
                        onClick={() =>
                          onGenresChange(
                            genres.filter((item) => item !== genre),
                          )
                        }
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="flex gap-2">
                <input
                  className="ws-input"
                  aria-label="Additional genre or gameplay tag"
                  placeholder="Add a genre or gameplay tag"
                  value={genreInput}
                  onChange={(event) => setGenreInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addGenre(genreInput);
                      setGenreInput("");
                    }
                  }}
                />
                <button
                  type="button"
                  aria-label="Add genre or gameplay tag"
                  className="ws-button secondary px-3"
                  onClick={() => {
                    addGenre(genreInput);
                    setGenreInput("");
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="ws-tags ws-suggestions">
                {GENRE_SUGGESTIONS.filter(
                  (suggestion) =>
                    !genres.some(
                      (genre) =>
                        genre.toLowerCase() === suggestion.toLowerCase(),
                    ),
                ).map((suggestion) => (
                  <button
                    type="button"
                    className="ws-tag"
                    key={suggestion}
                    onClick={() => addGenre(suggestion)}
                  >
                    <Plus size={11} />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
        <aside className="ws-stack">
          {candidates.length ? (
            <CandidateReview
              candidates={candidates}
              selectedSteamAppIds={selectedSteamAppIds}
              collecting={stage === "collecting"}
              onToggle={onToggleCandidate}
              onSelectAll={onSelectAllCandidates}
              onApprove={onApprove}
            />
          ) : hasCollectedResults ? (
            <section className="ws-panel">
              <div className="ws-empty">
                <Check size={28} />
                <h2>Your comparables are ready</h2>
                <p>
                  Return to the games you collected, or refine your concept to
                  start a new search.
                </p>
                <button
                  type="button"
                  className="ws-button mt-5"
                  onClick={onViewCollectedResults}
                >
                  View collected results <ArrowRight size={14} />
                </button>
              </div>
            </section>
          ) : validation?.status === "ready" && !busy ? (
            <section className="ws-panel">
              <div className="ws-empty">
                <Gamepad2 size={28} />
                <h2>No verified Steam matches yet</h2>
                <p>
                  Add a more specific gameplay or setting detail and search
                  again.
                </p>
              </div>
            </section>
          ) : null}
          <section className="ws-panel">
            <div className="ws-panel-head">
              <div>
                <h2>Think like your players</h2>
                <p>A specific description makes a better shortlist.</p>
              </div>
            </div>
            <div className="ws-panel-body">
              {[
                {
                  icon: Gamepad2,
                  title: "What’s the core loop?",
                  body: "What players do each session, how they progress, and why they return.",
                },
                {
                  icon: UsersRound,
                  title: "Who’s playing together?",
                  body: "Solo, co-op, or competitive. Include perspective, tone, and session length.",
                },
                {
                  icon: Sparkles,
                  title: "What makes it yours?",
                  body: "The mechanic, setting, or combination that gives your game its identity.",
                },
              ].map((item) => (
                <div className="ws-guide-step" key={item.title}>
                  <span className="ws-guide-icon">
                    <item.icon size={16} />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="ws-panel-body border-t border-[var(--ws-border)]">
              <p className="ws-muted text-[11px] leading-6 mb-3">
                Need a starting point? Explore a sample concept, then make it
                your own.
              </p>
              <button
                type="button"
                className="ws-text-button"
                disabled={busy}
                onClick={() => onDescriptionChange(EXAMPLE)}
              >
                Try an example <ArrowRight size={13} />
              </button>
            </div>
          </section>
          <div className="px-2 ws-safety-note">
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <p>
              You stay in control. Review the shortlist before we collect live
              data or build your analysis.
            </p>
          </div>
        </aside>
      </div>
    </WorkspaceShell>
  );
}

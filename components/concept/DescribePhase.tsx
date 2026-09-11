"use client";

import { useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Check,
  CircleDollarSign,
  CircleHelp,
  FileUp,
  Gamepad2,
  Pencil,
  Plus,
  RotateCcw,
  UsersRound,
  X,
} from "lucide-react";
import StepPills, { type Step } from "@/components/shared/StepPills";
import { ProcessIndicator } from "@/components/shared/ProcessIndicator";
import { GENRE_SUGGESTIONS } from "@/components/concept/options";
import { isCanonicalTag } from "@/lib/domain/tag-vocabulary";
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
  notices: string[];
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

const EXAMPLE_CONCEPTS = [
  {
    label: "Co-op horror (sample)",
    text: "A four-player survival horror game where crews investigate abandoned orbital stations, recover salvage, and escape an adaptive creature. Sessions last 30-45 minutes with proximity voice chat and persistent ship upgrades.",
  },
  {
    label: "Roguelike deckbuilder",
    text: "A single-player roguelike deckbuilder where players draft cards from a procedurally generated spell library, battle through branching dungeon floors, and unlock persistent meta-progression between runs. Pixel art aesthetic with 20-minute run target.",
  },
  {
    label: "Farming sim with combat",
    text: "A cozy farming simulation with real-time combat dungeons beneath the farm. Players grow crops by day, explore procedural caves at night, craft gear from harvested materials, and rebuild a ruined village. Supports 2-player local co-op.",
  },
];

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
        aria-label="Additional genre or gameplay tag"
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
  const checkItems = [
    { label: "Understood core concept", done: true },
    { label: "Identified key mechanics", done: validation.tags.some((t) => t.category === "mechanic") },
    { label: "Extracted target audience", done: validation.multiplayer !== null || validation.tags.some((t) => t.category === "mode" || t.category === "perspective") },
    { label: "Found relevant genres", done: validation.tags.some((t) => t.category === "genre" || t.category === "theme") },
  ];

  const genreTags = validation.tags.filter((t) => t.category === "genre" || t.category === "theme");
  const modeTags = validation.tags.filter((t) => t.category === "mode" || t.category === "perspective");
  const mechanicTags = validation.tags.filter((t) => t.category === "mechanic");

  return (
    <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit size={18} className="text-primary" aria-hidden="true" />
        <h3 className="text-[15px] font-semibold text-on-surface">AI Validation (Grok)</h3>
        <span className="ml-auto text-[11px] text-primary font-mono">
          {Math.round(validation.confidence * 100)}% confidence
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left column: checklist */}
        <div className="flex flex-col gap-2.5">
          {checkItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span className={`flex size-5 items-center justify-center rounded-full ${item.done ? "bg-green/15 text-green" : "bg-surface-container-highest text-on-surface-variant/40"}`}>
                <Check size={12} />
              </span>
              <span className={`text-[13px] ${item.done ? "text-on-surface" : "text-on-surface-variant/60"}`}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Right column: extracted elements */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-[13px] font-semibold text-on-surface">Key Elements Extracted</h4>
            <span className="px-2 py-0.5 rounded-full bg-green/15 text-green text-[10px] font-semibold">Looks good!</span>
          </div>
          <div className="flex flex-col gap-2">
            {genreTags.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-[11px] text-on-surface-variant shrink-0 w-[100px]">Genre:</span>
                <span className="text-[11px] text-on-surface">{genreTags.map((t) => t.name).join("/")}</span>
              </div>
            )}
            {modeTags.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-[11px] text-on-surface-variant shrink-0 w-[100px]">Game Mode:</span>
                <span className="text-[11px] text-on-surface">{modeTags.map((t) => t.name).join(", ")}</span>
              </div>
            )}
            {mechanicTags.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-[11px] text-on-surface-variant shrink-0 w-[100px]">Mechanics:</span>
                <span className="text-[11px] text-on-surface">{mechanicTags.map((t) => t.name).join("/")}</span>
              </div>
            )}
            {validation.tags.filter((t) => t.category === "theme").length > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-[11px] text-on-surface-variant shrink-0 w-[100px]">Theme:</span>
                <span className="text-[11px] text-on-surface">{validation.tags.filter((t) => t.category === "theme").map((t) => t.name).join("/")}</span>
              </div>
            )}
          </div>

          {/* All tags detail */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-outline-variant/15">
            {validation.tags.map((tag) => {
              const canonical = isCanonicalTag(tag.name);
              return (
                <span
                  key={tag.name.toLocaleLowerCase()}
                  title={`${tag.category} · ${tag.priority} · ${tag.basis}${canonical ? "" : " · free-form facet"}`}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono ${
                    canonical ? "border" : "border border-dashed"
                  } ${
                    tag.priority === "required"
                      ? "text-primary border-primary/30 bg-primary/10"
                      : "text-on-surface-variant border-outline-variant/20"
                  }`}
                >
                  <span className="opacity-50">{tag.category} · </span>
                  {tag.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Normalized description */}
      <p className="text-[12px] text-on-surface-variant leading-relaxed mt-4 pt-3 border-t border-outline-variant/15">
        {validation.normalizedDescription}
      </p>
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

function ConceptQualityBar({ length }: { length: number }) {
  const minLength = 20;
  const goodLength = 100;
  const greatLength = 200;
  const progress = Math.min((length / greatLength) * 100, 100);

  let qualityLabel: string;
  let qualityColor: string;
  let qualityMessage: string;

  if (length < minLength) {
    qualityLabel = "Too short";
    qualityColor = "bg-on-surface-variant/40";
    qualityMessage = "Add more detail to enable analysis.";
  } else if (length < goodLength) {
    qualityLabel = "Getting there";
    qualityColor = "bg-yellow-400";
    qualityMessage = "A bit more detail would improve results.";
  } else if (length < greatLength) {
    qualityLabel = "Good";
    qualityColor = "bg-green";
    qualityMessage = "Great! Your concept has enough detail for analysis.";
  } else {
    qualityLabel = "Excellent";
    qualityColor = "bg-green";
    qualityMessage = "Great! Your concept has enough detail for analysis.";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] font-semibold text-on-surface">Concept Quality</span>
        <span className="text-[11px] text-on-surface-variant font-mono">{qualityLabel}</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${qualityColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[11px] text-on-surface-variant mt-1.5">{qualityMessage}</p>
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
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<"write" | "import">("write");

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
    <div className="mx-auto max-w-[1320px] px-6 py-8">
      <StepPills active="describe" unlocked={unlockedSteps} onNavigate={onNavigate} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-[32px] font-semibold tracking-[-0.04em] text-on-surface">
          Let&apos;s start with your game concept
        </h1>
        <p className="mt-2 text-[14px] leading-6 text-on-surface-variant max-w-[640px]">
          Describe your game idea in natural language. Our AI will analyze it and find similar games automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main content area */}
        <div className="flex flex-col gap-5">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                activeTab === "write"
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Pencil size={14} aria-hidden="true" />
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("import")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                activeTab === "import"
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <FileUp size={14} aria-hidden="true" />
              Import from file
            </button>
          </div>

          {/* Textarea card */}
          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container overflow-hidden shadow-[0_18px_55px_rgba(0,0,0,0.12)] focus-within:border-primary/45">
            <div className="relative">
              <textarea
                id="game-description"
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                className="h-[200px] w-full resize-none bg-transparent p-5 pr-20 text-[15px] leading-7 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
                placeholder="Example: A four-player survival horror game where crews investigate abandoned orbital stations, recover salvage, and escape an adaptive creature. Sessions last 30-45 minutes with proximity voice chat and persistent ship upgrades."
              />
              <span className="absolute top-4 right-4 font-mono text-[11px] text-on-surface-variant">
                {description.length}/100
              </span>
            </div>

            <div className="px-5 pb-4">
              {/* Example pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] text-on-surface-variant">Try an example:</span>
                {EXAMPLE_CONCEPTS.map((example) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => onDescriptionChange(example.text)}
                    className="px-3 py-1 rounded-full text-[11px] border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors"
                  >
                    {example.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Concept Quality bar */}
          <ConceptQualityBar length={description.length} />

          {/* Analyze button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={description.trim().length < 20 || validating || stage === "collecting"}
              className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-[14px] font-semibold text-on-primary transition-all hover:bg-primary/90 disabled:opacity-30"
            >
              {validating
                ? "Checking concept..."
                : questions.length && hasAnsweredQuestion
                  ? "Validate answers"
                  : validation
                    ? "Validate again"
                    : "Validate concept"}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <span className="text-[11px] text-on-surface-variant">No market search begins before validation.</span>
          </div>

          {/* Error */}
          {error ? (
            <div role="alert" className="rounded-xl border border-red/30 bg-red/10 px-4 py-3 text-[13px] text-red">
              {error}
            </div>
          ) : null}

          {/* Notices */}
          {notices.length > 0 ? (
            <div role="status" className="rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3 text-[12px] text-on-surface-variant">
              {notices.map((notice) => <p key={notice}>{notice}</p>)}
            </div>
          ) : null}

          {/* Process indicator */}
          {stage !== "idle" ? (
            <ProcessIndicator kind={stage === "collecting" ? "collection" : "discovery"} />
          ) : null}

          {/* Clarifying questions */}
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

          {/* AI Validation panel */}
          {validation ? <ValidationPanel validation={validation} /> : null}

          {/* Optional market signals / genre tags */}
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

          {/* Candidate review (post-validation, below main content) */}
          {validation && candidates.length > 0 ? (
            <CandidateReview
              candidates={candidates}
              selectedSteamAppIds={selectedSteamAppIds}
              collecting={stage === "collecting"}
              onToggle={onToggleCandidate}
              onSelectAll={onSelectAllCandidates}
              onApprove={onApprove}
            />
          ) : null}

          {validation && candidates.length === 0 && hasCollectedResults ? (
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
          ) : null}

          {validation && candidates.length === 0 && !hasCollectedResults && validation.status === "ready" && !validating ? (
            <div className="rounded-xl bg-surface-container border border-outline-variant/20 p-5 text-[13px] text-on-surface-variant">
              No verified Steam matches were returned. Add a more specific gameplay or theme detail and validate again.
            </div>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="rounded-2xl border border-outline-variant/20 bg-surface-container p-5">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-secondary mb-5">Strong inputs include</p>
          <div className="space-y-4">
            {[
              {
                icon: Gamepad2,
                title: "The player loop",
                body: "Actions, session structure, progression",
              },
              {
                icon: UsersRound,
                title: "Audience and mode",
                body: "Solo, co-op, PvP, perspective, tone",
              },
              {
                icon: CircleDollarSign,
                title: "Commercial assumptions",
                body: "Target price, launch timing, positioning",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/8 text-primary">
                    <item.icon size={16} />
                  </span>
                  <h3 className="text-[13px] font-semibold text-on-surface">{item.title}</h3>
                </div>
                <p className="text-[11px] leading-5 text-on-surface-variant">{item.body}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Footer: New session */}
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

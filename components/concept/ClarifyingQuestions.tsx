"use client";

import type { ClarifyingQuestion, ConceptField } from "@/lib/domain/types";

export function ClarifyingQuestions({
  questions,
  onAnswer,
  onSkip,
}: {
  questions: ClarifyingQuestion[];
  onAnswer: (field: ConceptField, value: string) => void;
  onSkip: (field: ConceptField) => void;
}) {
  if (questions.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">A couple of quick questions:</p>
      {questions.map((q) => (
        <div key={q.field} className="space-y-2">
          <p className="text-sm font-medium">{q.question}</p>
          <div className="flex flex-wrap gap-2">
            {q.suggestions?.map((s) => (
              <button
                key={s}
                onClick={() => onAnswer(q.field, s)}
                className="px-3 py-1.5 text-sm rounded-full border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => onSkip(q.field)}
              className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-600"
            >
              Skip
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

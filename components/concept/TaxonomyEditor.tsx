"use client";

import { useState } from "react";
import type { GameConcept } from "@/lib/domain/types";

function TagChip({
  label,
  onRemove,
  lowConfidence,
}: {
  label: string;
  onRemove?: () => void;
  lowConfidence?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border ${
        lowConfidence
          ? "border-dashed border-amber-400 text-amber-700 dark:text-amber-300"
          : "border-zinc-300 dark:border-zinc-600"
      }`}
      title={lowConfidence ? "Low confidence \u2014 worth checking" : undefined}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} className="text-zinc-400 hover:text-zinc-600 ml-0.5">
          x
        </button>
      )}
    </span>
  );
}

function AddTag({ onAdd, placeholder }: { onAdd: (tag: string) => void; placeholder: string }) {
  const [value, setValue] = useState("");
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && value.trim()) {
          onAdd(value.trim());
          setValue("");
        }
      }}
      placeholder={placeholder}
      className="px-2.5 py-1 rounded-full text-sm border border-dashed border-zinc-300 dark:border-zinc-700 bg-transparent w-32 focus:outline-none focus:border-blue-500"
    />
  );
}

export function TaxonomyEditor({
  concept,
  onUpdate,
}: {
  concept: GameConcept;
  onUpdate: (patch: Partial<GameConcept>) => void;
}) {
  const t = concept.taxonomy;
  const c = concept.commercial;
  const conf = concept.confidence;

  const allGenres = [t.primaryGenre, ...t.secondaryGenres].filter(Boolean) as string[];

  const removeGenre = (g: string) => {
    if (g === t.primaryGenre) {
      onUpdate({
        taxonomy: { ...t, primaryGenre: t.secondaryGenres[0] ?? null, secondaryGenres: t.secondaryGenres.slice(1) },
      });
    } else {
      onUpdate({
        taxonomy: { ...t, secondaryGenres: t.secondaryGenres.filter((x) => x !== g) },
      });
    }
  };

  const removeMechanic = (m: string) => {
    onUpdate({ taxonomy: { ...t, mechanics: t.mechanics.filter((x) => x !== m) } });
  };

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
      <h3 className="text-lg font-semibold">Genre & mechanics</h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-zinc-500 mb-1.5">Genre</p>
          <div className="flex flex-wrap gap-2">
            {allGenres.map((g) => (
              <TagChip
                key={g}
                label={g}
                onRemove={() => removeGenre(g)}
                lowConfidence={(conf.primaryGenre ?? 1) < 0.5}
              />
            ))}
            <AddTag
              placeholder="+ genre"
              onAdd={(g) => onUpdate({ taxonomy: { ...t, secondaryGenres: [...t.secondaryGenres, g] } })}
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-zinc-500 mb-1.5">Themes</p>
          <div className="flex flex-wrap gap-2">
            {t.themes.map((th) => (
              <TagChip
                key={th}
                label={th}
                onRemove={() => onUpdate({ taxonomy: { ...t, themes: t.themes.filter((x) => x !== th) } })}
              />
            ))}
            <AddTag
              placeholder="+ theme"
              onAdd={(th) => onUpdate({ taxonomy: { ...t, themes: [...t.themes, th] } })}
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-zinc-500 mb-1.5">Mechanics</p>
          <div className="flex flex-wrap gap-2">
            {t.mechanics.map((m) => (
              <TagChip
                key={m}
                label={m}
                onRemove={() => removeMechanic(m)}
                lowConfidence={(conf.mechanics ?? 1) < 0.5}
              />
            ))}
            <AddTag
              placeholder="+ mechanic"
              onAdd={(m) => onUpdate({ taxonomy: { ...t, mechanics: [...t.mechanics, m] } })}
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">Modes</p>
            <div className="flex flex-wrap gap-2">
              {t.gameModes.map((m) => (
                <TagChip key={m} label={m} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">Perspective</p>
            <span className="text-sm">{t.perspective ?? "—"}</span>
          </div>
        </div>

        <div className="flex gap-6 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-xs text-zinc-500 mb-1">Price</p>
            <input
              type="number"
              step="0.01"
              value={c.priceUsd ?? ""}
              onChange={(e) =>
                onUpdate({ commercial: { ...c, priceUsd: e.target.value ? parseFloat(e.target.value) : null } })
              }
              placeholder="$14.99"
              className="w-24 px-2 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-transparent"
            />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Launch</p>
            <input
              type="text"
              value={c.plannedRelease ?? ""}
              onChange={(e) =>
                onUpdate({ commercial: { ...c, plannedRelease: e.target.value || null } })
              }
              placeholder="Oct 2026"
              className="w-28 px-2 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";

const ACCEPTED = [".json", ".md", ".txt"];

export function ImportDropzone({ onImport }: { onImport: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED.includes(ext)) {
        setError(`Only ${ACCEPTED.join(", ")} files are accepted.`);
        return;
      }
      if (file.size > 512 * 1024) {
        setError("File must be under 512 KB.");
        return;
      }
      setError(null);
      onImport(file);
    },
    [onImport],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
          : "border-zinc-300 dark:border-zinc-700"
      }`}
    >
      <p className="text-sm text-zinc-500">
        Drop a <code>.json</code>, <code>.md</code>, or <code>.txt</code> file
        here
      </p>
      <label className="mt-3 inline-block cursor-pointer text-sm font-medium text-blue-600 hover:underline">
        or browse
        <input
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

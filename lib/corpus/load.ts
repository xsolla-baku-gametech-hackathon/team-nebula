import { readFileSync } from 'fs';
import { join } from 'path';
import type { NormalizedGame, CorpusMeta } from '@/lib/types';

const CORPUS_PATH = process.env.CORPUS_PATH ?? './data';

export type Corpus = {
  games: NormalizedGame[];
  meta: CorpusMeta;
  vecs: Float32Array;
  upcoming: NormalizedGame[];
};

declare global {
  var __corpus: Corpus | undefined;
}

export function getCorpus(): Corpus {
  if (globalThis.__corpus) return globalThis.__corpus;

  const gamesPath = join(CORPUS_PATH, 'games.json');
  const indexPath = join(CORPUS_PATH, 'index.bin');

  const raw = JSON.parse(readFileSync(gamesPath, 'utf8'));
  const buf = readFileSync(indexPath);
  const vecs = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);

  if (vecs.length !== raw.meta.count * raw.meta.dims) {
    throw new Error('index.bin does not match games.json — corpus may be corrupted');
  }

  let upcoming: NormalizedGame[] = [];
  try {
    upcoming = JSON.parse(readFileSync(join(CORPUS_PATH, 'upcoming.json'), 'utf8'));
  } catch {
    // upcoming is optional
  }

  globalThis.__corpus = { games: raw.games, meta: raw.meta, vecs, upcoming };
  return globalThis.__corpus;
}

import type { GameConcept } from '@/lib/types';

export function buildConceptEmbedText(c: GameConcept): string {
  const t = c.taxonomy;
  return [
    c.concept.title ?? 'Untitled',
    c.concept.shortDescription,
    'Genres: ' + [t.primaryGenre, ...t.secondaryGenres].filter(Boolean).join(', '),
    'Themes: ' + t.themes.join(', '),
    'Mechanics: ' + t.mechanics.slice(0, 12).join(', '),
    'Modes: ' + t.gameModes.join(', '),
  ].join('\n');
}

export async function embedText(text: string): Promise<Float32Array> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Return zero vector as fallback
    return new Float32Array(1536);
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text, model: 'text-embedding-3-small' }),
  });

  if (!res.ok) return new Float32Array(1536);

  const data = await res.json();
  const vec = new Float32Array(data.data[0].embedding);

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < vec.length; i++) vec[i] /= norm;

  return vec;
}

export async function embedConcept(concept: GameConcept): Promise<Float32Array> {
  return embedText(buildConceptEmbedText(concept));
}

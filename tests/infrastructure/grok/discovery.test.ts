import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('ai', () => ({ generateText: vi.fn(), Output: { object: vi.fn(options => options) } }));
import { generateText } from 'ai';
import { rankPreviewCandidates, validateDescription } from '@/lib/infrastructure/grok/discovery';
import type { Candidate } from '@/lib/domain/schemas';
const validation = { status: 'ready' as const, normalizedDescription: 'Horror game', confidence: 0.9,
  tags: [
    { name: 'Horror', category: 'theme' as const, priority: 'required' as const, basis: 'explicit' as const },
    { name: 'Atmospheric', category: 'tone' as const, priority: 'preferred' as const, basis: 'inferred' as const },
  ], mustHave: ['horror'], avoid: [], multiplayer: null, questions: [] };
function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return { igdbId: 1, name: 'Comparable', description: 'A haunted investigation', context: 'Horror',
    gameModes: [1], semanticScore: 0.8, ...overrides };
}
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('XAI_API_KEY', 'test-key'); });
describe('Grok integration', () => {
  it('calls the provider with validated output and storage disabled', async () => {
    vi.mocked(generateText).mockResolvedValue({ output: validation } as Awaited<ReturnType<typeof generateText>>);
    expect(await validateDescription('horror', [{ question: 'Tone?', answer: 'Atmospheric' }])).toEqual(validation);
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({ prompt: JSON.stringify({ query: 'horror', clarifications: [{ question: 'Tone?', answer: 'Atmospheric' }] }) }));
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({ maxRetries: 1, providerOptions: { xai: { store: false, reasoningEffort: 'low' } } }));
    // The canonical vocabulary belongs in the system prompt, never in the untrusted payload.
    expect(vi.mocked(generateText).mock.calls[0][0].system).toContain('Platformer');
    expect(vi.mocked(generateText).mock.calls[0][0].prompt).not.toContain('Platformer');
  });
  it('fails explicitly when credentials are missing', async () => {
    vi.stubEnv('XAI_API_KEY', '');
    await expect(validateDescription('horror')).rejects.toMatchObject({ code: 'AI_NOT_CONFIGURED' });
    expect(generateText).not.toHaveBeenCalled();
  });
  it('never substitutes manual games or leaks provider errors', async () => {
    vi.mocked(generateText).mockRejectedValue(new Error('secret provider response'));
    await expect(validateDescription('horror')).rejects.toThrow('Grok could not produce');
    vi.mocked(generateText).mockResolvedValue({ output: { bad: true } } as unknown as Awaited<ReturnType<typeof generateText>>);
    await expect(validateDescription('horror')).rejects.toMatchObject({ code: 'AI_UNAVAILABLE' });
  });

  it('gives each call its own output budget', async () => {
    // A shared 4k ceiling truncated the ranking list, because reasoning tokens are
    // billed against the same budget as the answer.
    vi.mocked(generateText).mockResolvedValue({ output: validation } as Awaited<ReturnType<typeof generateText>>);
    await validateDescription('horror');
    expect(vi.mocked(generateText).mock.calls[0][0].maxOutputTokens).toBe(4000);

    vi.mocked(generateText).mockResolvedValue({ output: { selections: [] } } as unknown as Awaited<ReturnType<typeof generateText>>);
    await rankPreviewCandidates(validation, [candidate()]);
    expect(vi.mocked(generateText).mock.calls[1][0].maxOutputTokens).toBe(16000);
  });

  it('sends a trimmed candidate payload to the ranking model', async () => {
    // Full-length prose made copying exact ids a needle-in-a-haystack task.
    vi.mocked(generateText).mockResolvedValue({ output: { selections: [] } } as unknown as Awaited<ReturnType<typeof generateText>>);
    await rankPreviewCandidates(validation, [candidate({ description: 'd'.repeat(5000), context: 'c'.repeat(5000) })]);

    const { prompt } = vi.mocked(generateText).mock.calls[0][0];
    expect(prompt).toContain('d'.repeat(600));
    expect(prompt).not.toContain('d'.repeat(601));
    expect(prompt).toContain('c'.repeat(300));
    expect(prompt).not.toContain('c'.repeat(301));
    // The id must survive verbatim — it is the membership key.
    expect(prompt).toContain('"igdbId":1');
  });
});

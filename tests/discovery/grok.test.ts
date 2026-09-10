import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('ai', () => ({ generateText: vi.fn(), Output: { object: vi.fn(options => options) } }));
import { generateText } from 'ai';
import { interpretQuery } from '@/lib/discovery/grok';
const intent = { summary: 'Horror', searchQueries: ['horror'], mustHave: ['horror'], avoid: [], multiplayer: null };
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('XAI_API_KEY', 'test-key'); });
describe('Grok integration', () => {
  it('calls the provider with validated output and storage disabled', async () => {
    vi.mocked(generateText).mockResolvedValue({ output: intent } as Awaited<ReturnType<typeof generateText>>);
    expect(await interpretQuery('horror')).toEqual(intent);
    expect(generateText).toHaveBeenCalledWith(expect.objectContaining({ maxRetries: 0, providerOptions: { xai: { store: false, reasoningEffort: 'low' } } }));
  });
  it('fails explicitly when credentials are missing', async () => {
    vi.stubEnv('XAI_API_KEY', '');
    await expect(interpretQuery('horror')).rejects.toMatchObject({ code: 'AI_NOT_CONFIGURED' });
    expect(generateText).not.toHaveBeenCalled();
  });
  it('never substitutes manual games or leaks provider errors', async () => {
    vi.mocked(generateText).mockRejectedValue(new Error('secret provider response'));
    await expect(interpretQuery('horror')).rejects.toThrow('Grok could not produce');
    vi.mocked(generateText).mockResolvedValue({ output: { bad: true } } as unknown as Awaited<ReturnType<typeof generateText>>);
    await expect(interpretQuery('horror')).rejects.toMatchObject({ code: 'AI_UNAVAILABLE' });
  });
});

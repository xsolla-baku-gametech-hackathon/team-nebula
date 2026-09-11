import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ enter: vi.fn(), block: vi.fn(), close: vi.fn() }));
vi.mock('@/lib/infrastructure/mcp/auth', () => ({ mcpTokens: { get: async () => 'test-token', invalidate: vi.fn() } }));
vi.mock('@/lib/infrastructure/mcp/config', () => ({ mcpCredentials: () => ({ clientId: 'test-client', clientSecret: 'test-secret' }) }));
vi.mock('@/lib/infrastructure/collector/http', () => ({ providerGate: () => mocks }));
vi.mock('@/lib/infrastructure/mcp/result', () => ({ mcpResult: (value: unknown) => value }));
vi.mock('@modelcontextprotocol/sdk/client/streamableHttp.js', () => ({
  StreamableHTTPClientTransport: class {
    constructor(public url: URL, public options: { fetch: typeof fetch }) {}
  },
}));
vi.mock('@modelcontextprotocol/sdk/client/index.js', () => ({
  Client: class {
    async connect(transport: { url: URL; options: { fetch: typeof fetch } }) { await transport.options.fetch(transport.url, { method: 'POST' }); }
    async callTool() { return { results: [] }; }
    close = mocks.close;
  },
}));
import { withMcp } from '@/lib/infrastructure/mcp/client';
beforeEach(() => { vi.clearAllMocks(); mocks.enter.mockResolvedValue(undefined); mocks.close.mockResolvedValue(undefined); });
describe('MCP transport recovery', () => {
  it('retries a connection failure once and closes the session', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new TypeError('connection failed')).mockResolvedValueOnce(new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    await expect(withMcp(call => call('query', {}))).resolves.toEqual({ results: [] });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(mocks.close).toHaveBeenCalledTimes(1);
  });
  it('does not retry quota failures', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('', { status: 429 }));
    vi.stubGlobal('fetch', fetch);
    await expect(withMcp(call => call('query', {}))).rejects.toMatchObject({ code: 'rate_limited' });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(mocks.block).toHaveBeenCalledWith(60_000);
  });
});

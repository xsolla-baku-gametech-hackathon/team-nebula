import { afterEach, expect, it, vi } from 'vitest';
import { McpTokenManager } from '@/lib/infrastructure/mcp/auth';
import { requestText } from '@/lib/infrastructure/collector/http';
vi.mock('@/lib/infrastructure/collector/http', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/infrastructure/collector/http')>(), requestText: vi.fn(),
}));
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.clearAllMocks(); });

it('shares token acquisition and refreshes before expiry', async () => {
  vi.useFakeTimers();
  vi.stubEnv('IGDB_MCP_CLIENT_ID', 'test-client');
  vi.stubEnv('IGDB_MCP_CLIENT_SECRET', 'test-secret');
  vi.mocked(requestText).mockResolvedValueOnce('{"access_token":"one","expires_in":600}')
    .mockResolvedValueOnce('{"access_token":"two","expires_in":600}');
  const manager = new McpTokenManager();
  expect(await Promise.all([manager.get(), manager.get()])).toEqual(['one', 'one']);
  expect(requestText).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(301000);
  expect(await manager.get()).toBe('two');
  manager.invalidate('one');
  expect(await manager.get()).toBe('two');
  expect(requestText).toHaveBeenCalledTimes(2);
});

it('requires MCP credentials and rejects malformed token responses', async () => {
  vi.stubEnv('IGDB_MCP_CLIENT_ID', '');
  vi.stubEnv('IGDB_MCP_CLIENT_SECRET', '');
  await expect(new McpTokenManager().get()).rejects.toMatchObject({code:'not_configured'});
  vi.stubEnv('IGDB_MCP_CLIENT_ID', 'client');
  vi.stubEnv('IGDB_MCP_CLIENT_SECRET', 'secret');
  vi.mocked(requestText).mockResolvedValue('{}');
  await expect(new McpTokenManager().get()).rejects.toMatchObject({code:'invalid_data'});
});

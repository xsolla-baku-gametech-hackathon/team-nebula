import 'server-only';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { mcpTokens } from './auth';
import { mcpCredentials } from './config';
import { providerGate } from '@/lib/infrastructure/collector/http';
import { mcpResult } from './result';
import { ProviderError } from '@/lib/infrastructure/collector/types';

export async function withMcp<T>(run: (call: (name: string, args: Record<string, unknown>) => Promise<unknown>) => Promise<T>): Promise<T> {
  const { clientId } = mcpCredentials();
  const client = new Client({ name: 'similar-games-data-collector', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL('https://mcp.igdb.com/mcp'), {
    fetch: async (url, init) => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const token = await mcpTokens.get();
        await providerGate('igdb').enter();
        const headers = new Headers(init?.headers);
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Client-ID', clientId);
        const timeout = AbortSignal.timeout(15_000);
        let response: Response;
        try {
          response = await fetch(url, { ...init, headers, cache: 'no-store',
            signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout });
        } catch (error) {
          if (attempt === 0 && !init?.signal?.aborted) continue;
          throw error;
        }
        if (response.status >= 500 && attempt === 0) {
          await response.body?.cancel();
          continue;
        }
        if (response.status === 401 && attempt === 0) {
          await response.body?.cancel();
          mcpTokens.invalidate(token);
          continue;
        }
        if (response.status === 429) {
          providerGate('igdb').block(60_000);
          await response.body?.cancel();
          throw new ProviderError('igdb', 'rate_limited', 'IGDB request quota is temporarily exhausted');
        }
        return response;
      }
      throw new ProviderError('igdb', 'unavailable', 'IGDB authentication failed');
    },
  });
  try {
    await client.connect(transport, { timeout: 20_000 });
    return await run(async (name, args) => mcpResult(await client.callTool({ name, arguments: args }, undefined, { timeout: 20_000 })));
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new ProviderError('igdb', 'unavailable', 'IGDB lookup failed or timed out');
  } finally { await client.close().catch(() => undefined); }
}

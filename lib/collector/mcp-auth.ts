import 'server-only';
import { z } from 'zod';
import { mcpCredentials } from './mcp-config';
import { parseJson, parseProvider, requestText } from './http';

export async function requestMcpToken() {
  const { clientId, clientSecret } = mcpCredentials();
  const response = await requestText('igdb', 'https://mcp-auth.igdb.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials', scope: 'igdb-mcp/read' }),
  });
  const token = parseProvider('igdb', z.object({ access_token: z.string().min(1), expires_in: z.number().positive().finite() }), parseJson('igdb', response));
  return { value: token.access_token, refreshAt: Date.now() + Math.max(1, token.expires_in - Math.min(300, token.expires_in / 2)) * 1000 };
}

/** Retains authentication only. No game records or tool results are retained. */
export class McpTokenManager {
  private token?: Awaited<ReturnType<typeof requestMcpToken>>;
  private pending?: Promise<Awaited<ReturnType<typeof requestMcpToken>>>;

  async get() {
    if (this.token && this.token.refreshAt > Date.now()) return this.token.value;
    this.pending ??= requestMcpToken();
    try { this.token = await this.pending; return this.token.value; }
    finally { this.pending = undefined; }
  }

  invalidate(value: string) {
    if (this.token?.value === value) this.token = undefined;
  }
}

declare global { var __collectorMcpTokens: McpTokenManager | undefined; }
export const mcpTokens = globalThis.__collectorMcpTokens ??= new McpTokenManager();

/**
 * IGDB data fetcher via MCP SDK.
 * Connects to the IGDB MCP server as a subprocess and calls its tools directly.
 * No Twitch OAuth needed — the MCP server handles auth internally.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

let client: Client | null = null;
let transport: StdioClientTransport | null = null;

export async function connectIgdb(): Promise<Client> {
  if (client) return client;

  transport = new StdioClientTransport({
    command: 'uvx',
    args: ['igdb-mcp-client'],
    env: {
      ...process.env,
      CLIENT_ID: process.env.TWITCH_CLIENT_ID ?? '',
      CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET ?? '',
    },
  });

  client = new Client(
    { name: 'releasesignal-corpus-builder', version: '1.0.0' },
    { capabilities: {} },
  );

  await client.connect(transport);

  const { tools } = await client.listTools();
  console.log('  IGDB MCP tools:', tools.map(t => t.name).join(', '));

  return client;
}

export async function disconnectIgdb(): Promise<void> {
  if (transport) {
    await transport.close();
    transport = null;
    client = null;
  }
}

export async function callIgdbTool(name: string, args: Record<string, unknown>): Promise<string> {
  if (!client) throw new Error('IGDB MCP client not connected');

  const result = await client.callTool({ name, arguments: args });

  const texts: string[] = [];
  if (Array.isArray(result.content)) {
    for (const item of result.content) {
      if ((item as { type: string }).type === 'text') {
        texts.push((item as { type: string; text: string }).text);
      }
    }
  }
  return texts.join('\n');
}

// Convenience wrappers matching the IGDB MCP server's tools

export async function igdbQuery(entity: string, opts: {
  fields?: string[];
  filters?: Record<string, unknown>;
  sort?: { field: string; order: string };
  limit?: number;
  offset?: number;
}): Promise<{ results: unknown[]; count: number }> {
  const text = await callIgdbTool('query', { entity, ...opts });
  return JSON.parse(text);
}

export async function igdbSearch(entity: string, query: string, opts?: {
  fields?: string[];
  limit?: number;
}): Promise<{ results: unknown[]; count: number }> {
  const text = await callIgdbTool('search', { entity, query, ...opts });
  return JSON.parse(text);
}

export async function igdbGetDetails(entity: string, ids: number[], fields?: string[]): Promise<{ results: unknown[]; count: number }> {
  const text = await callIgdbTool('get_details', { entity, ids, fields });
  return JSON.parse(text);
}

export async function igdbSemanticSearch(query: string, opts?: {
  fields?: string[];
  limit?: number;
}): Promise<{ results: unknown[]; count: number }> {
  const text = await callIgdbTool('semantic_search_games', { query, ...opts });
  return JSON.parse(text);
}

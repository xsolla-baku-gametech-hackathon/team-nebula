import { z } from 'zod';
import { parseJson, parseProvider } from './http';
import { ProviderError } from './types';

export function mcpResult(input: unknown): unknown {
  const result = parseProvider('igdb', z.object({
    isError: z.boolean().optional(), structuredContent: z.unknown().optional(),
    content: z.array(z.object({type:z.string(),text:z.string().optional()})).optional(),
  }), input);
  if (result.isError) throw new ProviderError('igdb', 'unavailable', 'IGDB MCP could not complete this lookup');
  if (result.structuredContent !== undefined) return result.structuredContent;
  const text = result.content?.filter(item => item.type === 'text').map(item => item.text ?? '').join('\n');
  return parseJson('igdb', text ?? '');
}

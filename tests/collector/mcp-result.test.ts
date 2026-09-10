import { describe, expect, it } from 'vitest';
import { mcpResult } from '@/lib/collector/mcp-result';

describe('MCP result validation', () => {
  it('accepts structured results and JSON text', () => {
    expect(mcpResult({ structuredContent: { results: [] } })).toEqual({ results: [] });
    expect(mcpResult({ content: [{ type: 'text', text: '{"count":0}' }] })).toEqual({ count: 0 });
  });
  it('does not expose provider error bodies', () => {
    expect(() => mcpResult({ isError: true, content: [{ type: 'text', text: 'secret' }] })).toThrow('could not complete');
    expect(() => mcpResult({ content: [{ type: 'text', text: 'invalid' }] })).toThrow('invalid JSON');
  });
});

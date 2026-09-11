import 'server-only';
import { ProviderError } from '@/lib/infrastructure/collector/types';

export function mcpCredentials() {
  const clientId = process.env.IGDB_MCP_CLIENT_ID;
  const clientSecret = process.env.IGDB_MCP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new ProviderError('igdb', 'not_configured', 'IGDB MCP credentials are not configured');
  }
  return { clientId, clientSecret };
}

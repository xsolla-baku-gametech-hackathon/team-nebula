import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const sourceExtensions = new Set(['.ts', '.tsx']);

function sourceFiles(directory: string): string[] {
  const absolute = join(root, directory);
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const path = join(absolute, entry.name);
    if (entry.isDirectory()) return sourceFiles(relative(root, path));
    return sourceExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

function importedAliases(path: string): string[] {
  const source = readFileSync(path, 'utf8');
  return [...source.matchAll(/from\s+['"](@\/[^'"]+)['"]|import\s+['"](@\/[^'"]+)['"]/g)]
    .map((match) => match[1] ?? match[2]);
}

describe('architecture boundaries', () => {
  it('keeps the domain independent from application and infrastructure code', () => {
    const violations = sourceFiles('lib/domain').flatMap((path) =>
      importedAliases(path)
        .filter((dependency) => /^@\/lib\/(application|infrastructure|api|session)\//.test(dependency))
        .map((dependency) => `${relative(root, path)} -> ${dependency}`),
    );

    expect(violations).toEqual([]);
  });

  it('keeps React components independent from provider implementations', () => {
    const violations = sourceFiles('components').flatMap((path) =>
      importedAliases(path)
        .filter((dependency) => dependency.startsWith('@/lib/infrastructure/'))
        .map((dependency) => `${relative(root, path)} -> ${dependency}`),
    );

    expect(violations).toEqual([]);
  });

  it('does not reintroduce legacy source directories', () => {
    const legacyFiles = [
      'components/forecast',
      'components/phases',
      'lib/ai',
      'lib/analysis',
      'lib/collector',
      'lib/corpus',
      'lib/discovery',
      'lib/scoring',
    ].flatMap((directory) => {
      try {
        return sourceFiles(directory).map((path) => relative(root, path));
      } catch {
        return [];
      }
    });

    expect(legacyFiles).toEqual([]);
  });
});

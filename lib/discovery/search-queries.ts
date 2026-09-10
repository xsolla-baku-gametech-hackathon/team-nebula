import type { DescriptionValidation } from './types';

export function buildSearchQueries(validation: DescriptionValidation): string[] {
  const required = validation.tags.filter(tag => tag.priority === 'required').map(tag => tag.name);
  const preferred = validation.tags.filter(tag => tag.priority === 'preferred').map(tag => tag.name);
  const primary = [validation.normalizedDescription, ...required, ...preferred.slice(0, 4)].join('. ');
  const facets = validation.tags.map(tag => `${tag.category}: ${tag.name}`).join(', ');
  return [...new Set([primary, `${validation.normalizedDescription}. ${facets}`])]
    .map(query => query.slice(0, 500)).filter(query => query.length >= 3).slice(0, 2);
}

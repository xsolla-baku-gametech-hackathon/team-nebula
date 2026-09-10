import { describe, expect, it } from 'vitest';
import { analysisHorizonWeeks, dateInputValue, launchDateError } from '@/lib/session/launch-inputs';

const today = new Date('2026-09-10T15:00:00.000Z');

describe('launch inputs', () => {
  it.each([
    ['2026-10-20', '2026-10-20'],
    ['2026-10', '2026-10-15'],
    ['October 2026', '2026-10-15'],
    ['Q4 2026', '2026-11-15'],
  ])('normalizes %s for a date input', (value, expected) => {
    expect(dateInputValue(value)).toBe(expected);
  });

  it('requires a valid future date within one year', () => {
    expect(launchDateError(null, today)).toMatch(/Choose/);
    expect(launchDateError('2026-13-40', today)).toMatch(/valid/);
    expect(launchDateError('2026-09-09', today)).toMatch(/today or later/);
    expect(launchDateError('2027-09-11', today)).toMatch(/12 months/);
    expect(launchDateError('2027-09-10', today)).toBeNull();
  });

  it('keeps at least 26 weeks and adds eight weeks after the planned launch', () => {
    expect(analysisHorizonWeeks('2026-10-01', today)).toBe(26);
    expect(analysisHorizonWeeks('2027-04-01', today)).toBe(37);
    expect(analysisHorizonWeeks('2027-09-10', today)).toBe(52);
  });
});

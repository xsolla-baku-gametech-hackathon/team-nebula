const months: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
};

export function dateInputValue(value: string | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-15`;

  const month = value.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (month) {
    const number = months[month[1].toLocaleLowerCase()];
    if (number) return `${month[2]}-${number}-15`;
  }

  const quarter = value.trim().match(/^Q([1-4])\s+(\d{4})$/i);
  if (quarter) {
    const middleMonth = String((Number(quarter[1]) - 1) * 3 + 2).padStart(2, '0');
    return `${quarter[2]}-${middleMonth}-15`;
  }
  return '';
}

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function launchDateError(value: string | null, today = new Date()): string | null {
  const normalized = dateInputValue(value);
  if (!normalized) return 'Choose a planned release date before running predictions.';

  const candidate = new Date(`${normalized}T00:00:00.000Z`);
  const start = new Date(`${dateOnly(today)}T00:00:00.000Z`);
  const maximum = new Date(start);
  maximum.setUTCFullYear(maximum.getUTCFullYear() + 1);

  if (candidate < start) return 'The planned release date must be today or later.';
  if (candidate > maximum) return 'The live launch calendar supports dates within the next 12 months.';
  return null;
}

export function analysisHorizonWeeks(value: string, today = new Date()): number {
  const release = new Date(`${dateInputValue(value)}T00:00:00.000Z`);
  const start = new Date(`${dateOnly(today)}T00:00:00.000Z`);
  const weeksToRelease = Math.ceil((release.getTime() - start.getTime()) / (7 * 86_400_000));
  return Math.min(52, Math.max(26, weeksToRelease + 8));
}

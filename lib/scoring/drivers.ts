import type { Driver } from '@/lib/types';

export function driver(label: string, contribution: number, detail: string): Driver {
  return { label, contribution, detail };
}

export function sumDrivers(drivers: Driver[]): number {
  return drivers.reduce((sum, d) => sum + d.contribution, 0);
}

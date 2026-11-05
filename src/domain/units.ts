export type Unit = 'm' | 'yd';

export const YARD_IN_METERS = 0.9144;

export function toDisplay(meters: number, unit: Unit): number {
  return Math.round(unit === 'yd' ? meters / YARD_IN_METERS : meters);
}

export function toMeters(value: number, unit: Unit): number {
  return unit === 'yd' ? value * YARD_IN_METERS : value;
}

export function formatDistance(meters: number, unit: Unit): string {
  return `${toDisplay(meters, unit)} ${unit}`;
}

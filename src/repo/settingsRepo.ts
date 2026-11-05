import type { Db } from '../db/types';
import type { Unit } from '../domain/units';

export async function getUnit(db: Db): Promise<Unit> {
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM settings WHERE key = 'unit'");
  return row?.value === 'yd' ? 'yd' : 'm';
}

export async function setUnit(db: Db, unit: Unit): Promise<void> {
  await db.runAsync(
    "INSERT INTO settings (key, value) VALUES ('unit', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    unit,
  );
}

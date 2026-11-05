import type { Db } from './types';

export type Migration = { version: number; up: (db: Db) => Promise<void> };

const DEFAULT_CLUBS = [
  'Driver',
  '3 Wood',
  '5 Wood',
  'Hybrid',
  '4 Iron',
  '5 Iron',
  '6 Iron',
  '7 Iron',
  '8 Iron',
  '9 Iron',
  'PW',
  'GW',
  'SW',
  'LW',
  'Putter',
];

const DEFAULT_TAGS: Record<'shape' | 'strike', string[]> = {
  shape: ['Straight', 'Draw', 'Fade', 'Hook', 'Slice'],
  strike: ['Pure', 'Thin', 'Fat', 'Topped', 'Shank'],
};

export const migrations: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
        CREATE TABLE clubs (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE COLLATE NOCASE, sort_order INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1);
        CREATE TABLE tags (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL CHECK (category IN ('shape','strike')), name TEXT NOT NULL COLLATE NOCASE, sort_order INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1, UNIQUE (category, name));
      `);
      await db.runAsync("INSERT INTO settings (key, value) VALUES ('unit', 'm')");
      for (const [i, name] of DEFAULT_CLUBS.entries()) {
        await db.runAsync('INSERT INTO clubs (name, sort_order) VALUES (?, ?)', name, i);
      }
      for (const category of ['shape', 'strike'] as const) {
        for (const [i, name] of DEFAULT_TAGS[category].entries()) {
          await db.runAsync('INSERT INTO tags (category, name, sort_order) VALUES (?, ?, ?)', category, name, i);
        }
      }
    },
  },
];

async function currentVersion(db: Db): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

export async function migrate(db: Db, list: Migration[] = migrations): Promise<number> {
  let version = await currentVersion(db);
  const pending = list.filter((m) => m.version > version).sort((a, b) => a.version - b.version);
  for (const m of pending) {
    await db.execAsync('BEGIN');
    try {
      await m.up(db);
      await db.execAsync(`PRAGMA user_version = ${m.version}`);
      await db.execAsync('COMMIT');
    } catch (e) {
      await db.execAsync('ROLLBACK');
      throw e;
    }
    version = m.version;
  }
  return version;
}

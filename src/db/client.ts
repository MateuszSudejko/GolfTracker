import { openDatabaseAsync } from 'expo-sqlite';
import { migrate } from './migrations';
import type { Db } from './types';

export async function openDb(): Promise<Db> {
  const db = await openDatabaseAsync('golftracker.db');
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db);
  return db;
}

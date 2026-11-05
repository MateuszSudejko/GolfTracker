import { DatabaseSync } from 'node:sqlite';
import type { Db } from '../../src/db/types';

type Param = string | number | null;

function flat(params: unknown[]): Param[] {
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0] as Param[];
  }
  return params as Param[];
}

export function createTestDb(): Db {
  const raw = new DatabaseSync(':memory:');
  const db = {
    async execAsync(source: string) {
      raw.exec(source);
    },
    async runAsync(source: string, ...params: unknown[]) {
      const r = raw.prepare(source).run(...flat(params));
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    async getAllAsync(source: string, ...params: unknown[]) {
      return raw.prepare(source).all(...flat(params));
    },
    async getFirstAsync(source: string, ...params: unknown[]) {
      return raw.prepare(source).get(...flat(params)) ?? null;
    },
  };
  return db as unknown as Db;
}

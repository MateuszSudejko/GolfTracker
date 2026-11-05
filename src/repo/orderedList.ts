import type { Db } from '../db/types';
import { normalizeName, ValidationError } from '../domain/names';

export type Direction = 'up' | 'down';

export type Row = { id: number; name: string; sort_order: number; active: number };

export type Scope = {
  table: 'clubs' | 'tags';
  where: string;
  params: (string | number)[];
  duplicateMessage: string;
};

export async function listRows(db: Db, scope: Scope, includeHidden: boolean): Promise<Row[]> {
  const filter = includeHidden ? '' : ' AND active = 1';
  return db.getAllAsync<Row>(
    `SELECT id, name, sort_order, active FROM ${scope.table} WHERE ${scope.where}${filter} ORDER BY sort_order, id`,
    ...scope.params,
  );
}

async function assertUnique(db: Db, scope: Scope, name: string, excludeId: number | null): Promise<void> {
  const row = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM ${scope.table} WHERE ${scope.where} AND name = ? COLLATE NOCASE AND id != ?`,
    ...scope.params,
    name,
    excludeId ?? -1,
  );
  if (row) {
    throw new ValidationError(scope.duplicateMessage);
  }
}

export async function insertRow(
  db: Db,
  scope: Scope,
  raw: string,
  columns: Record<string, string | number>,
): Promise<Row> {
  const name = normalizeName(raw);
  await assertUnique(db, scope, name, null);
  const max = await db.getFirstAsync<{ m: number | null }>(
    `SELECT MAX(sort_order) AS m FROM ${scope.table} WHERE ${scope.where}`,
    ...scope.params,
  );
  const sortOrder = (max?.m ?? -1) + 1;
  const keys = Object.keys(columns);
  const cols = ['name', 'sort_order', ...keys].join(', ');
  const marks = ['?', '?', ...keys.map(() => '?')].join(', ');
  const result = await db.runAsync(
    `INSERT INTO ${scope.table} (${cols}) VALUES (${marks})`,
    name,
    sortOrder,
    ...keys.map((k) => columns[k]),
  );
  return { id: result.lastInsertRowId, name, sort_order: sortOrder, active: 1 };
}

export async function renameRow(db: Db, scope: Scope, id: number, raw: string): Promise<void> {
  const name = normalizeName(raw);
  await assertUnique(db, scope, name, id);
  await db.runAsync(`UPDATE ${scope.table} SET name = ? WHERE id = ?`, name, id);
}

export async function setRowActive(db: Db, table: Scope['table'], id: number, active: boolean): Promise<void> {
  await db.runAsync(`UPDATE ${table} SET active = ? WHERE id = ?`, active ? 1 : 0, id);
}

export async function moveRow(db: Db, scope: Scope, id: number, direction: Direction): Promise<void> {
  const rows = await listRows(db, scope, true);
  const index = rows.findIndex((r) => r.id === id);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) {
    return;
  }
  const reordered = [...rows];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  await db.execAsync('BEGIN');
  try {
    for (const [i, row] of reordered.entries()) {
      await db.runAsync(`UPDATE ${scope.table} SET sort_order = ? WHERE id = ?`, i, row.id);
    }
    await db.execAsync('COMMIT');
  } catch (e) {
    await db.execAsync('ROLLBACK');
    throw e;
  }
}

import type { Db } from '../db/types';
import { ValidationError } from '../domain/names';
import { Direction, insertRow, listRows, moveRow, renameRow, Row, Scope, setRowActive } from './orderedList';

export type Club = { id: number; name: string; sortOrder: number; active: boolean };

const scope: Scope = {
  table: 'clubs',
  where: '1 = 1',
  params: [],
  duplicateMessage: 'A club with that name already exists',
};

function toClub(row: Row): Club {
  return { id: row.id, name: row.name, sortOrder: row.sort_order, active: row.active === 1 };
}

export async function listClubs(db: Db, opts?: { includeHidden?: boolean }): Promise<Club[]> {
  return (await listRows(db, scope, opts?.includeHidden ?? false)).map(toClub);
}

export async function addClub(db: Db, name: string): Promise<Club> {
  return toClub(await insertRow(db, scope, name, {}));
}

export async function renameClub(db: Db, id: number, name: string): Promise<void> {
  await renameRow(db, scope, id, name);
}

export async function setClubActive(db: Db, id: number, active: boolean): Promise<void> {
  if (!active) {
    const others = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM clubs WHERE active = 1 AND id != ?',
      id,
    );
    if ((others?.n ?? 0) === 0) {
      throw new ValidationError('Keep at least one club active');
    }
  }
  await setRowActive(db, 'clubs', id, active);
}

export async function moveClub(db: Db, id: number, direction: Direction): Promise<void> {
  await moveRow(db, scope, id, direction);
}

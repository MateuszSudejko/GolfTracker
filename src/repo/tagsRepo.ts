import type { Db } from '../db/types';
import { Direction, insertRow, listRows, moveRow, renameRow, Row, Scope, setRowActive } from './orderedList';

export type TagCategory = 'shape' | 'strike';

export type Tag = { id: number; category: TagCategory; name: string; sortOrder: number; active: boolean };

function scopeFor(category: TagCategory): Scope {
  return {
    table: 'tags',
    where: 'category = ?',
    params: [category],
    duplicateMessage: 'A tag with that name already exists',
  };
}

async function categoryOf(db: Db, id: number): Promise<TagCategory> {
  const row = await db.getFirstAsync<{ category: TagCategory }>('SELECT category FROM tags WHERE id = ?', id);
  if (!row) {
    throw new Error(`Tag ${id} not found`);
  }
  return row.category;
}

function toTag(category: TagCategory, row: Row): Tag {
  return { id: row.id, category, name: row.name, sortOrder: row.sort_order, active: row.active === 1 };
}

export async function listTags(db: Db, category: TagCategory, opts?: { includeHidden?: boolean }): Promise<Tag[]> {
  const rows = await listRows(db, scopeFor(category), opts?.includeHidden ?? false);
  return rows.map((r) => toTag(category, r));
}

export async function addTag(db: Db, category: TagCategory, name: string): Promise<Tag> {
  return toTag(category, await insertRow(db, scopeFor(category), name, { category }));
}

export async function renameTag(db: Db, id: number, name: string): Promise<void> {
  await renameRow(db, scopeFor(await categoryOf(db, id)), id, name);
}

export async function setTagActive(db: Db, id: number, active: boolean): Promise<void> {
  await setRowActive(db, 'tags', id, active);
}

export async function moveTag(db: Db, id: number, direction: Direction): Promise<void> {
  await moveRow(db, scopeFor(await categoryOf(db, id)), id, direction);
}

import { migrate, migrations } from '../../src/db/migrations';
import { createTestDb } from '../helpers/nodeDb';

async function count(db: ReturnType<typeof createTestDb>, table: string): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`);
  return row!.n;
}

async function version(db: ReturnType<typeof createTestDb>): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  return row!.user_version;
}

test('fresh db migrates to latest', async () => {
  const db = createTestDb();
  await expect(migrate(db)).resolves.toBe(1);
  expect(await version(db)).toBe(1);
  expect(await count(db, 'clubs')).toBe(15);
  expect(await count(db, 'tags')).toBe(10);
  const unit = await db.getFirstAsync<{ value: string }>("SELECT value FROM settings WHERE key = 'unit'");
  expect(unit!.value).toBe('m');
});

test('running migrate twice does not duplicate seeds', async () => {
  const db = createTestDb();
  await migrate(db);
  await migrate(db);
  expect(await count(db, 'clubs')).toBe(15);
  expect(await count(db, 'tags')).toBe(10);
});

test('failed migration rolls back', async () => {
  const db = createTestDb();
  const list = [
    migrations[0],
    {
      version: 2,
      up: async (d: typeof db) => {
        await d.execAsync('CREATE TABLE junk (x)');
        throw new Error('boom');
      },
    },
  ];
  await expect(migrate(db, list)).rejects.toThrow('boom');
  expect(await version(db)).toBe(1);
  const junk = await db.getFirstAsync("SELECT name FROM sqlite_master WHERE name = 'junk'");
  expect(junk).toBeNull();
});

import { migrate } from '../../src/db/migrations';
import { addClub, listClubs, moveClub, renameClub, setClubActive } from '../../src/repo/clubsRepo';
import { createTestDb } from '../helpers/nodeDb';

async function setup() {
  const db = createTestDb();
  await migrate(db);
  return db;
}

test('lists seeded clubs in order', async () => {
  const clubs = await listClubs(await setup());
  expect(clubs).toHaveLength(15);
  expect(clubs[0].name).toBe('Driver');
  expect(clubs[14].name).toBe('Putter');
  expect(clubs[0].active).toBe(true);
});

test('add normalizes name and appends last', async () => {
  const db = await setup();
  const club = await addClub(db, '  Mini   Driver ');
  expect(club.name).toBe('Mini Driver');
  const clubs = await listClubs(db);
  expect(clubs[clubs.length - 1].id).toBe(club.id);
});

test('add rejects duplicate ignoring case and spaces', async () => {
  await expect(addClub(await setup(), ' pw ')).rejects.toThrow('A club with that name already exists');
});

test('add rejects empty name', async () => {
  await expect(addClub(await setup(), '   ')).rejects.toThrow('Name cannot be empty');
});

test('add rejects too long name', async () => {
  await expect(addClub(await setup(), 'x'.repeat(31))).rejects.toThrow('Name too long');
});

test('rename to own name with different case succeeds', async () => {
  const db = await setup();
  const [driver] = await listClubs(db);
  await renameClub(db, driver.id, 'DRIVER');
  expect((await listClubs(db))[0].name).toBe('DRIVER');
});

test('rename to another club name rejects', async () => {
  const db = await setup();
  const [driver] = await listClubs(db);
  await expect(renameClub(db, driver.id, 'putter')).rejects.toThrow('A club with that name already exists');
});

test('hidden club only listed with includeHidden', async () => {
  const db = await setup();
  const [driver] = await listClubs(db);
  await setClubActive(db, driver.id, false);
  expect((await listClubs(db)).find((c) => c.id === driver.id)).toBeUndefined();
  const all = await listClubs(db, { includeHidden: true });
  expect(all.find((c) => c.id === driver.id)?.active).toBe(false);
});

test('cannot hide last active club', async () => {
  const db = await setup();
  const clubs = await listClubs(db);
  for (const c of clubs.slice(1)) {
    await setClubActive(db, c.id, false);
  }
  await expect(setClubActive(db, clubs[0].id, false)).rejects.toThrow('Keep at least one club active');
});

test('move up at top is no-op and move down swaps', async () => {
  const db = await setup();
  const [first, second] = await listClubs(db);
  await moveClub(db, first.id, 'up');
  expect((await listClubs(db))[0].id).toBe(first.id);
  await moveClub(db, first.id, 'down');
  const after = await listClubs(db);
  expect(after[0].id).toBe(second.id);
  expect(after[1].id).toBe(first.id);
});

import { migrate } from '../../src/db/migrations';
import { addTag, listTags, moveTag, renameTag, setTagActive } from '../../src/repo/tagsRepo';
import { createTestDb } from '../helpers/nodeDb';

async function setup() {
  const db = createTestDb();
  await migrate(db);
  return db;
}

test('lists seeded shape tags in order', async () => {
  const tags = await listTags(await setup(), 'shape');
  expect(tags.map((t) => t.name)).toEqual(['Straight', 'Draw', 'Fade', 'Hook', 'Slice']);
});

test('duplicate in same category rejects', async () => {
  await expect(addTag(await setup(), 'strike', 'pure')).rejects.toThrow('A tag with that name already exists');
});

test('same name in other category allowed', async () => {
  const db = await setup();
  const tag = await addTag(db, 'shape', 'Pure');
  expect(tag.category).toBe('shape');
  expect((await listTags(db, 'shape')).map((t) => t.name)).toContain('Pure');
});

test('rename rejects duplicate', async () => {
  const db = await setup();
  const [straight] = await listTags(db, 'shape');
  await expect(renameTag(db, straight.id, 'draw')).rejects.toThrow('A tag with that name already exists');
});

test('hide all tags in category allowed', async () => {
  const db = await setup();
  for (const t of await listTags(db, 'shape')) {
    await setTagActive(db, t.id, false);
  }
  expect(await listTags(db, 'shape')).toHaveLength(0);
  expect(await listTags(db, 'shape', { includeHidden: true })).toHaveLength(5);
});

test('move down at bottom is no-op and move up swaps', async () => {
  const db = await setup();
  const tags = await listTags(db, 'strike');
  const last = tags[tags.length - 1];
  const prev = tags[tags.length - 2];
  await moveTag(db, last.id, 'down');
  expect((await listTags(db, 'strike')).at(-1)!.id).toBe(last.id);
  await moveTag(db, last.id, 'up');
  const after = await listTags(db, 'strike');
  expect(after.at(-1)!.id).toBe(prev.id);
  expect(after.at(-2)!.id).toBe(last.id);
});

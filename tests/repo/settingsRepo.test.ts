import { migrate } from '../../src/db/migrations';
import { getUnit, setUnit } from '../../src/repo/settingsRepo';
import { createTestDb } from '../helpers/nodeDb';

test('default unit is meters', async () => {
  const db = createTestDb();
  await migrate(db);
  expect(await getUnit(db)).toBe('m');
});

test('unit change persists', async () => {
  const db = createTestDb();
  await migrate(db);
  await setUnit(db, 'yd');
  expect(await getUnit(db)).toBe('yd');
});

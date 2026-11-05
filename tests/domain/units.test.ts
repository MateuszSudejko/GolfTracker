import { toDisplay, toMeters, formatDistance } from '../../src/domain/units';

test('meters display unchanged rounded', () => {
  expect(toDisplay(137.4, 'm')).toBe(137);
});

test('meters to yards', () => {
  expect(toDisplay(137.16, 'yd')).toBe(150);
});

test('yards round-trip stays exact', () => {
  for (const yd of [1, 50, 100, 149, 150, 151, 250, 300]) {
    expect(toDisplay(toMeters(yd, 'yd'), 'yd')).toBe(yd);
  }
});

test('format includes unit label', () => {
  expect(formatDistance(137.16, 'yd')).toBe('150 yd');
  expect(formatDistance(100, 'm')).toBe('100 m');
});

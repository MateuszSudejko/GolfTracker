import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useDb } from '../../db/DbProvider';
import type { Unit } from '../../domain/units';
import { getUnit, setUnit } from '../../repo/settingsRepo';
import { Screen } from '../../ui/Screen';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { colors, fontSize, minTap, spacing } from '../../ui/theme';

const unitOptions: { value: Unit; label: string }[] = [
  { value: 'm', label: 'Meters' },
  { value: 'yd', label: 'Yards' },
];

export default function SettingsScreen() {
  const db = useDb();
  const [unit, setUnitState] = useState<Unit | null>(null);

  useEffect(() => {
    getUnit(db).then(setUnitState);
  }, [db]);

  async function changeUnit(next: Unit) {
    setUnitState(next);
    await setUnit(db, next);
  }

  return (
    <Screen scroll>
      <Text style={styles.section}>Units</Text>
      {unit ? <SegmentedControl options={unitOptions} value={unit} onChange={changeUnit} /> : null}
      <Text style={styles.section}>Equipment and tags</Text>
      <Link href="/settings/clubs" asChild>
        <Pressable style={styles.row}>
          <Text style={styles.rowText}>Club bag</Text>
        </Pressable>
      </Link>
      <Link href="/settings/tags" asChild>
        <Pressable style={styles.row}>
          <Text style={styles.rowText}>Shot tags</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { color: colors.muted, fontSize: fontSize.body, marginTop: spacing.sm },
  row: {
    minHeight: minTap,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  rowText: { color: colors.text, fontSize: fontSize.body },
});

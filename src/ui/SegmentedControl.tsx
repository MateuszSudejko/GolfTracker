import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, minTap, spacing } from './theme';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.root}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.selected]}
            onPress={() => onChange(o.value)}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: { flex: 1, minHeight: minTap - spacing.sm, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: colors.accent },
  label: { color: colors.text, fontSize: fontSize.body },
  selectedLabel: { color: colors.bg, fontWeight: '700' },
});

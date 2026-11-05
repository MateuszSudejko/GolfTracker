import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, minTap, spacing } from './theme';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  testID?: string;
};

const backgrounds: Record<Variant, string> = {
  primary: colors.accent,
  secondary: colors.surface,
  danger: colors.danger,
};

export function BigButton({ label, onPress, variant = 'primary', disabled = false, testID }: Props) {
  const textColor = variant === 'primary' ? colors.bg : colors.text;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: backgrounds[variant], opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTap,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: fontSize.body, fontWeight: '600' },
});

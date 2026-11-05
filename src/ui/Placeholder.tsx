import { StyleSheet, Text } from 'react-native';
import { Screen } from './Screen';
import { colors, fontSize } from './theme';

export function Placeholder({ title }: { title: string }) {
  return (
    <Screen>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.muted}>Coming in a later phase</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: fontSize.title, fontWeight: '700' },
  muted: { color: colors.muted, fontSize: fontSize.body },
});

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DbProvider } from '../db/DbProvider';
import { colors } from '../ui/theme';

export default function RootLayout() {
  return (
    <DbProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings/clubs" options={{ title: 'Club bag' }} />
        <Stack.Screen name="settings/tags" options={{ title: 'Shot tags' }} />
      </Stack>
    </DbProvider>
  );
}

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../ui/theme';
import { openDb } from './client';
import type { Db } from './types';

const DbContext = createContext<Db | null>(null);

export function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Db | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    openDb()
      .then((opened) => {
        if (!cancelled) setDb(opened);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Could not open your data</Text>
        <Text style={styles.message}>{error}</Text>
      </View>
    );
  }
  if (!db) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
}

export function useDb(): Db {
  const db = useContext(DbContext);
  if (!db) {
    throw new Error('useDb must be used inside DbProvider');
  }
  return db;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: spacing.lg, gap: spacing.sm },
  title: { color: colors.text, fontSize: fontSize.title, fontWeight: '700' },
  message: { color: colors.danger, fontSize: fontSize.body, textAlign: 'center' },
});

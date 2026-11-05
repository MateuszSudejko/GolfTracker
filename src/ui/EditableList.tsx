import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ValidationError } from '../domain/names';
import { BigButton } from './BigButton';
import { colors, fontSize, minTap, spacing } from './theme';

export type EditableItem = { id: number; name: string; active: boolean };

type Props = {
  items: EditableItem[];
  onAdd: (name: string) => Promise<void>;
  onRename: (id: number, name: string) => Promise<void>;
  onToggleActive: (id: number, active: boolean) => Promise<void>;
  onMove: (id: number, direction: 'up' | 'down') => Promise<void>;
  addPlaceholder: string;
};

function messageFor(e: unknown): string {
  return e instanceof ValidationError ? e.message : 'Something went wrong';
}

export function EditableList({ items, onAdd, onRename, onToggleActive, onMove, addPlaceholder }: Props) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  async function attempt(action: () => Promise<void>): Promise<boolean> {
    try {
      await action();
      setError(null);
      return true;
    } catch (e) {
      setError(messageFor(e));
      return false;
    }
  }

  async function add() {
    if (await attempt(() => onAdd(draft))) {
      setDraft('');
    }
  }

  async function saveRename(id: number) {
    if (await attempt(() => onRename(id, editText))) {
      setEditingId(null);
    }
  }

  function startEdit(item: EditableItem) {
    setEditingId(item.id);
    setEditText(item.name);
  }

  const active = items.filter((i) => i.active);
  const hidden = items.filter((i) => !i.active);

  function row(item: EditableItem) {
    return (
      <View key={item.id} style={styles.row}>
        {editingId === item.id ? (
          <TextInput
            testID={`rename-${item.id}`}
            style={[styles.input, styles.flex]}
            value={editText}
            onChangeText={setEditText}
            onSubmitEditing={() => saveRename(item.id)}
            onBlur={() => setEditingId(null)}
            autoFocus
            returnKeyType="done"
            placeholderTextColor={colors.muted}
          />
        ) : (
          <Pressable style={[styles.flex, styles.nameCell]} onPress={() => startEdit(item)}>
            <Text style={[styles.name, !item.active && styles.mutedText]}>{item.name}</Text>
          </Pressable>
        )}
        <Pressable testID={`up-${item.id}`} style={styles.iconButton} onPress={() => attempt(() => onMove(item.id, 'up'))}>
          <Text style={styles.iconText}>Up</Text>
        </Pressable>
        <Pressable testID={`down-${item.id}`} style={styles.iconButton} onPress={() => attempt(() => onMove(item.id, 'down'))}>
          <Text style={styles.iconText}>Down</Text>
        </Pressable>
        <Pressable
          testID={`toggle-${item.id}`}
          style={styles.iconButton}
          onPress={() => attempt(() => onToggleActive(item.id, !item.active))}
        >
          <Text style={styles.iconText}>{item.active ? 'Hide' : 'Show'}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.flex]}
          value={draft}
          onChangeText={setDraft}
          placeholder={addPlaceholder}
          placeholderTextColor={colors.muted}
          onSubmitEditing={add}
          returnKeyType="done"
        />
        <BigButton label="Add" onPress={add} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {active.map(row)}
      {hidden.length > 0 ? <Text style={styles.header}>Hidden</Text> : null}
      {hidden.map(row)}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flex: { flex: 1 },
  input: {
    minHeight: minTap,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.body,
    paddingHorizontal: spacing.md,
  },
  nameCell: { minHeight: minTap, justifyContent: 'center' },
  name: { color: colors.text, fontSize: fontSize.body },
  mutedText: { color: colors.muted },
  iconButton: {
    minHeight: minTap,
    minWidth: minTap,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { color: colors.text, fontSize: 15 },
  error: { color: colors.danger, fontSize: fontSize.body },
  header: { color: colors.muted, fontSize: fontSize.body, marginTop: spacing.md },
});

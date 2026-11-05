import { useCallback, useEffect, useState } from 'react';
import { useDb } from '../../db/DbProvider';
import { addTag, listTags, moveTag, renameTag, setTagActive, Tag, TagCategory } from '../../repo/tagsRepo';
import { EditableList } from '../../ui/EditableList';
import { Screen } from '../../ui/Screen';
import { withReload } from '../../ui/withReload';
import { SegmentedControl } from '../../ui/SegmentedControl';

const categoryOptions: { value: TagCategory; label: string }[] = [
  { value: 'shape', label: 'Shape' },
  { value: 'strike', label: 'Strike' },
];

export default function TagsScreen() {
  const db = useDb();
  const [category, setCategory] = useState<TagCategory>('shape');
  const [tags, setTags] = useState<Tag[]>([]);

  const reload = useCallback(async () => {
    setTags(await listTags(db, category, { includeHidden: true }));
  }, [db, category]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <Screen scroll>
      <SegmentedControl options={categoryOptions} value={category} onChange={setCategory} />
      <EditableList
        items={tags}
        addPlaceholder={category === 'shape' ? 'New shape tag' : 'New strike tag'}
        onAdd={withReload(reload, (name: string) => addTag(db, category, name))}
        onRename={withReload(reload, (id: number, name: string) => renameTag(db, id, name))}
        onToggleActive={withReload(reload, (id: number, active: boolean) => setTagActive(db, id, active))}
        onMove={withReload(reload, (id: number, dir: 'up' | 'down') => moveTag(db, id, dir))}
      />
    </Screen>
  );
}

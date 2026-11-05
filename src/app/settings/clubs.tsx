import { useCallback, useEffect, useState } from 'react';
import { useDb } from '../../db/DbProvider';
import { addClub, Club, listClubs, moveClub, renameClub, setClubActive } from '../../repo/clubsRepo';
import { EditableList } from '../../ui/EditableList';
import { Screen } from '../../ui/Screen';
import { withReload } from '../../ui/withReload';

export default function ClubsScreen() {
  const db = useDb();
  const [clubs, setClubs] = useState<Club[]>([]);

  const reload = useCallback(async () => {
    setClubs(await listClubs(db, { includeHidden: true }));
  }, [db]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <Screen scroll>
      <EditableList
        items={clubs}
        addPlaceholder="New club"
        onAdd={withReload(reload, (name: string) => addClub(db, name))}
        onRename={withReload(reload, (id: number, name: string) => renameClub(db, id, name))}
        onToggleActive={withReload(reload, (id: number, active: boolean) => setClubActive(db, id, active))}
        onMove={withReload(reload, (id: number, dir: 'up' | 'down') => moveClub(db, id, dir))}
      />
    </Screen>
  );
}

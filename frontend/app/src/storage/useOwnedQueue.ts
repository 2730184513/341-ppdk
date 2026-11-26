import { useEffect } from 'react';
import { useQuery } from '../api/useQuery';
import { ownedQueue } from './database';

/** Queue state is scoped to a teacher and optionally a student; missing identity remains unknown. */
export function useOwnedQueue(ownerTeacherId: string | undefined, studentId?: string) {
  const result = useQuery(JSON.stringify(['owned-queue', ownerTeacherId, studentId]), async () => {
    if (!ownerTeacherId) throw new Error('Teacher identity is unavailable.');
    const rows = await ownedQueue(ownerTeacherId);
    return studentId === undefined ? rows : rows.filter((row) => row.studentId === studentId);
  });
  useEffect(() => {
    const change = (event: Event) => {
      const keys = (event as CustomEvent<unknown>).detail;
      if (
        Array.isArray(keys) &&
        keys.some((key) => typeof key === 'string' && key.startsWith('queue:'))
      )
        result.reload();
    };
    addEventListener('ppdk-storage', change);
    return () => removeEventListener('ppdk-storage', change);
  }, [result.reload]);
  return ownerTeacherId ? result : { ...result, data: undefined, loading: true };
}

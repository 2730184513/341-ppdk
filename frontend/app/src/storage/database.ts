import { realmName } from './realm';
import type { Bundle, DTO, Receipt } from '../api/types';
import type { Draft } from '../features/learning/draft';

const NAME = realmName('ppdk.learning.v1');
const commits =
  typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(realmName('ppdk.storage-commits.v1'))
    : undefined;
commits?.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (Array.isArray(event.data) && event.data.every((key) => typeof key === 'string'))
    dispatchEvent(new CustomEvent('ppdk-storage', { detail: event.data }));
});
import.meta.hot?.dispose(() => commits?.close());
type QueueState = 'pending' | 'sending' | 'synced' | 'needs_auth' | 'conflict' | 'invalid';
export type LocalContext = {
  closeUnknown?: boolean;
  info: DTO['ContextInfo'];
  bundle: Bundle;
  input: DTO['PrepareContextRequest'];
  ready: boolean;
};
export type QueueEntry = {
  ownerTeacherId: string;
  studentId: string;
  alias: string;
  title: string;
  envelope: DTO['AttemptEnvelope'];
  state: QueueState;
  receipt?: Receipt;
  error?: string;
  retries: number;
  retryAt: number;
};
type RecordValue = { key: string; value: unknown };
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('records', { keyPath: 'key' });
    request.onerror = () => reject(request.error ?? new Error('Local storage could not open.'));
    request.onsuccess = () => resolve(request.result);
  });
}
export async function readLocal<T>(key: string): Promise<T | undefined> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('records', 'readonly');
    const request = tx.objectStore('records').get(key);
    tx.oncomplete = () => {
      db.close();
      resolve((request.result as RecordValue | undefined)?.value as T | undefined);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error('Local read failed.'));
    };
  });
}
export async function allLocal<T>(prefix: string): Promise<T[]> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('records', 'readonly');
    const request = tx.objectStore('records').getAll(IDBKeyRange.bound(prefix, prefix + '\uffff'));
    tx.oncomplete = () => {
      db.close();
      resolve((request.result as RecordValue[]).map((row) => row.value as T));
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error('Local read failed.'));
    };
  });
}
export async function writeLocal(entries: RecordValue[]) {
  const db = await database();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('records', 'readwrite', { durability: 'strict' });
    let synchronousFailure: unknown;
    tx.oncomplete = () => {
      db.close();
      const keys = entries.map((entry) => entry.key);
      dispatchEvent(new CustomEvent('ppdk-storage', { detail: keys }));
      try {
        commits?.postMessage(keys);
      } catch {
        // A disposed development channel must not turn a committed save into a pending promise.
      }
      resolve();
    };
    tx.onabort = () => {
      db.close();
      reject(
        synchronousFailure ?? tx.error ?? new Error('Not saved. Keep this page open and retry.'),
      );
    };
    try {
      for (const entry of entries) tx.objectStore('records').put(entry);
    } catch (error) {
      // A synchronous clone/quota failure must abort earlier writes in this transaction.
      synchronousFailure = error;
      tx.abort();
    }
  });
}
export const saveLocal = (key: string, value: unknown) => writeLocal([{ key, value }]);
export async function deviceId() {
  return navigator.locks.request(realmName('ppdk.device-id'), async () => {
    const existing = await readLocal<string>('device-id');
    if (existing) return existing;
    const id = crypto.randomUUID();
    await saveLocal('device-id', id);
    return id;
  });
}
export async function probeStorage() {
  const value = crypto.randomUUID();
  await saveLocal('probe', value);
  if ((await readLocal<string>('probe')) !== value) throw new Error('Storage verification failed.');
  const entries = await allLocal<QueueEntry>('queue:');
  if (entries.length >= 50)
    throw new Error(
      '50 saved practices are retained on this device, including confirmed records. Ask an adult for maintenance. No records are automatically removed.',
    );
}
export async function saveDraft(draft: Draft, context: LocalContext) {
  const entries: RecordValue[] = [{ key: 'draft:' + draft.envelope.attemptId, value: draft }];
  if (draft.terminal) {
    const existing = await readLocal<QueueEntry>('queue:' + draft.envelope.attemptId);
    if (!existing) {
      if ((await allLocal<QueueEntry>('queue:')).length >= 50)
        throw new Error(
          '50 saved practices are retained. This change is not saved; keep the page open and ask an adult.',
        );
      const title =
        context.bundle.activities.find((a) => a.id === draft.envelope.activityId)?.title ??
        draft.envelope.activityId;
      const entry: QueueEntry = {
        ownerTeacherId: draft.ownerTeacherId,
        studentId: context.info.studentId,
        alias: context.bundle.student.alias,
        title,
        envelope: draft.envelope,
        state: 'pending',
        retries: 0,
        retryAt: 0,
      };
      entries.push({ key: 'queue:' + draft.envelope.attemptId, value: entry });
    }
  }
  await writeLocal(entries);
}
export async function ownedQueue(ownerTeacherId: string) {
  return (await allLocal<QueueEntry>('queue:')).filter(
    (row) => row.ownerTeacherId === ownerTeacherId,
  );
}

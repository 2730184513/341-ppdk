import { useEffect, useState } from 'react';
import { readLocal, type LocalContext, type QueueEntry } from '../../storage/database';
import type { Draft } from './draft';
import { replayAttempt } from './evidence';

type SavedResult = { draft: Draft; queued: QueueEntry; derived: ReturnType<typeof replayAttempt> };

export function useSavedResult(attemptId: string, local: LocalContext) {
  const key = local.info.contextId + ':' + attemptId;
  const [state, setState] = useState<{
    key: string;
    data?: SavedResult;
    error?: Error;
    loading: boolean;
  }>({ key, loading: true });
  useEffect(() => {
    let alive = true;
    let generation = 0;
    async function refresh() {
      const request = ++generation;
      try {
        const [draft, queued] = await Promise.all([
          readLocal<Draft>('draft:' + attemptId),
          readLocal<QueueEntry>('queue:' + attemptId),
        ]);
        if (!alive || request !== generation) return;
        if (
          !draft?.terminal ||
          draft.envelope.contextId !== local.info.contextId ||
          queued?.envelope.attemptId !== attemptId ||
          queued.envelope.contextId !== local.info.contextId
        )
          throw new Error('This result is not saved yet. Ask an adult for help.');
        const activity = local.bundle.activities.find(
          (entry) => entry.id === draft.envelope.activityId,
        );
        if (!activity)
          throw new Error('The frozen activity is unavailable. Ask an adult for help.');
        const derived = replayAttempt(activity, draft.envelope, local.bundle.settings);
        setState({ key, data: { draft, queued, derived }, loading: false });
      } catch (error) {
        if (!alive || request !== generation) return;
        setState((previous) => ({
          key,
          data: previous.key === key ? previous.data : undefined,
          loading: false,
          error: error instanceof Error ? error : new Error('Saved result could not be read.'),
        }));
      }
    }
    function changed(event: Event) {
      const keys: unknown = (event as CustomEvent<unknown>).detail;
      if (
        Array.isArray(keys) &&
        keys.some((value) => value === 'queue:' + attemptId || value === 'draft:' + attemptId)
      )
        void refresh();
    }
    addEventListener('ppdk-storage', changed);
    void refresh();
    return () => {
      alive = false;
      removeEventListener('ppdk-storage', changed);
    };
  }, [attemptId, key, local]);
  return state.key === key ? state : { key, loading: true };
}

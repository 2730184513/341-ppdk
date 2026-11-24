import type { DTO } from '../api/types';
import { emptyCounts } from '../features/learning/evidence';
import { reject } from './repository';

export function confirmedSet(attempts: DTO['AttemptDetail'][], studentId: string, url: URL) {
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  if (
    (from && !Number.isFinite(Date.parse(from))) ||
    (to && !Number.isFinite(Date.parse(to))) ||
    (from && to && Date.parse(from) >= Date.parse(to))
  )
    reject(422, 'VALIDATION_FAILED', 'Use a valid date range.');
  const activityId = url.searchParams.get('activityId');
  return attempts
    .filter(
      (a) =>
        a.receipt.studentId === studentId &&
        (!activityId || a.activityId === activityId) &&
        (!from || Date.parse(a.occurredAt) >= Date.parse(from)) &&
        (!to || Date.parse(a.occurredAt) < Date.parse(to)),
    )
    .sort(
      (a, b) =>
        b.occurredAt.localeCompare(a.occurredAt) ||
        b.receipt.attemptId.localeCompare(a.receipt.attemptId),
    );
}
const ratio = (n: number, d: number) => (d ? Math.round((n / d) * 1e6) / 1e6 : null);
export function summarize(
  attempts: DTO['AttemptDetail'][],
  studentId: string,
  url: URL,
): DTO['Summary'] {
  const counts = emptyCounts();
  for (const attempt of attempts)
    for (const key of Object.keys(counts) as (keyof typeof counts)[])
      counts[key] += attempt.receipt.counts[key];
  const completedCount = attempts.filter((a) => a.receipt.state === 'completed').length;
  return {
    studentId,
    generatedAt: new Date().toISOString(),
    latestReceivedAt: attempts.length
      ? attempts
          .map((a) => a.receipt.receivedAt)
          .sort()
          .at(-1)!
      : null,
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    counts,
    completedCount,
    finishedWithSkipsCount: attempts.filter((a) => a.receipt.state === 'finished_with_skips')
      .length,
    endedEarlyCount: attempts.filter((a) => a.receipt.state === 'ended_early').length,
    rewardCount: attempts.filter((a) => a.receipt.rewardKind !== null).length,
    completionRate: ratio(completedCount, attempts.length),
    firstCorrectRate: ratio(counts.firstCorrectUnassisted, counts.firstSubmitted),
    responseCoverage: ratio(counts.firstSubmitted, counts.plannedItems),
    resolutionRate: ratio(counts.resolvedItems, counts.plannedItems),
    adultAssistance: 'UNKNOWN',
    otherDeviceSyncState: 'UNKNOWN',
  };
}
export function listItem(detail: DTO['AttemptDetail']): DTO['AttemptListItem'] {
  return {
    attemptId: detail.receipt.attemptId,
    activityId: detail.activityId,
    activityVersion: detail.activityVersion,
    state: detail.receipt.state,
    occurredAt: detail.occurredAt,
    receivedAt: detail.receipt.receivedAt,
    activeMs: detail.activeMs,
    counts: detail.receipt.counts,
  };
}

import type { Activity, Counts, DTO, Envelope, Item } from '../../api/types';

export function visibleChoices(item: DTO['SelectItem'], count: 2 | 3) {
  if (count === 3) return item.choices;
  const distractor = item.choices.find((c) => c.id !== item.correctChoiceId);
  return item.choices.filter((c) => c.id === item.correctChoiceId || c.id === distractor?.id);
}
export function isCorrect(item: Item, answer: DTO['Answer']) {
  if (item.type === 'SELECT_ONE' && answer.type === 'SELECT_ONE')
    return answer.selectedChoiceId === item.correctChoiceId;
  if (item.type === 'ORDER_STEPS' && answer.type === 'ORDER_STEPS')
    return JSON.stringify(answer.orderedCardIds) === JSON.stringify(item.correctOrder);
  return false;
}
export function emptyCounts(): Counts {
  return {
    plannedItems: 0,
    firstSubmitted: 0,
    firstCorrectUnassisted: 0,
    resolvedItems: 0,
    hintedItems: 0,
    demonstratedItems: 0,
    skippedItems: 0,
    unattemptedItems: 0,
    unfinishedItems: 0,
    replayCount: 0,
  };
}
function requireEvidence(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
export function replayItem(
  item: Item,
  evidence: DTO['ItemEvidence'],
  count: 2 | 3,
): DTO['ItemOutcome'] {
  requireEvidence(
    Number.isSafeInteger(evidence.activeMs) &&
      evidence.activeMs >= 0 &&
      evidence.activeMs <= 86400000,
    'Item active time must be a non-negative integer within the attempt budget.',
  );
  const result: DTO['ItemOutcome'] = {
    itemId: item.id,
    outcome: evidence.visited ? 'unfinished' : 'unattempted',
    firstSubmitted: false,
    firstCorrectUnassisted: false,
    hinted: false,
    demonstrated: false,
    replayCount: 0,
    activeMs: evidence.activeMs,
  };
  requireEvidence(
    evidence.visited || (!evidence.events.length && evidence.activeMs === 0),
    'Unvisited items cannot contain events or time.',
  );
  let terminal = false;
  for (const [index, event] of evidence.events.entries()) {
    requireEvidence(
      !terminal && event.seq === index + 1,
      'Events must be consecutive and stop at the terminal event.',
    );
    if (event.kind === 'REPLAY') {
      result.replayCount++;
      continue;
    }
    if (event.kind === 'SKIP') {
      result.outcome = 'skipped';
      terminal = true;
      continue;
    }
    if (event.kind === 'HINT_REVEALED') {
      requireEvidence(
        item.type === 'SELECT_ONE' && !result.hinted,
        'A select hint may be revealed once.',
      );
      result.hinted = true;
      continue;
    }
    if (event.kind === 'DEMO_REVEALED') {
      requireEvidence(
        item.type === 'ORDER_STEPS' && !result.demonstrated,
        'An order example may be revealed once.',
      );
      result.demonstrated = true;
      continue;
    }
    if (event.kind === 'DEMO_COMPLETED') {
      requireEvidence(
        item.type === 'ORDER_STEPS' && result.demonstrated,
        'Reveal the example before completing it.',
      );
      result.outcome = 'assisted_demo';
      terminal = true;
      continue;
    }
    requireEvidence(
      !result.demonstrated && event.kind === 'ANSWER' && event.answer.type === item.type,
      'Answer kind must match the activity; no answer after an example.',
    );
    const answer = event.answer;
    if (item.type === 'SELECT_ONE' && answer.type === 'SELECT_ONE')
      requireEvidence(
        visibleChoices(item, count).some((c) => c.id === answer.selectedChoiceId),
        'Selected choice must be visible in the frozen support setting.',
      );
    if (item.type === 'ORDER_STEPS' && answer.type === 'ORDER_STEPS')
      requireEvidence(
        answer.orderedCardIds.length === 3 &&
          new Set(answer.orderedCardIds).size === 3 &&
          answer.orderedCardIds.every((id) => item.cards.some((c) => c.id === id)),
        'Order answer must contain all three cards once.',
      );
    const correct = isCorrect(item, answer);
    if (!result.firstSubmitted) result.firstCorrectUnassisted = correct && !result.hinted;
    if (correct) {
      result.outcome = 'correct_first';
      if (result.firstSubmitted) result.outcome = 'correct_after_retry';
      if (result.hinted) result.outcome = 'correct_with_hint';
      terminal = true;
    }
    result.firstSubmitted = true;
  }
  return result;
}
export function isTerminal(outcome: DTO['ItemOutcome']['outcome']) {
  return !['unfinished', 'unattempted'].includes(outcome);
}
export function replayAttempt(
  activity: Activity,
  envelope: Envelope,
  settings: DTO['SupportSettings'],
) {
  requireEvidence(
    envelope.items.length === activity.items.length,
    'Evidence must contain every authored item.',
  );
  const items = envelope.items.map((evidence, index) => {
    const item = activity.items[index];
    requireEvidence(item.id === evidence.itemId, 'Evidence must preserve authored item order.');
    return replayItem(item, evidence, settings.optionCount);
  });
  let open = false;
  for (const [index, evidence] of envelope.items.entries()) {
    requireEvidence(
      !open || !evidence.visited,
      'Unvisited items must be a suffix; unfinished items cannot be skipped over.',
    );
    open ||= !evidence.visited || !isTerminal(items[index].outcome);
  }
  const activeMs = envelope.items.reduce((total, item) => total + item.activeMs, 0);
  requireEvidence(
    activeMs === envelope.activeMs,
    'Attempt active time must equal the sum of item active times.',
  );
  // Wall clocks may move backwards. Active time is measured independently and checked above.
  requireEvidence(
    [envelope.startedAt, envelope.endedAt].every(
      (value) => Number.isFinite(Date.parse(value)) && /(?:Z|[+-]\d{2}:\d{2})$/i.test(value),
    ),
    'Start and end times must be valid timestamps with an explicit timezone.',
  );
  requireEvidence(
    (envelope.endReason === 'FINISHED') === items.every((item) => isTerminal(item.outcome)),
    'Finished requires every item terminal; stop requires unfinished work.',
  );
  const counts = emptyCounts();
  for (const item of items) {
    counts.plannedItems++;
    counts.firstSubmitted += Number(item.firstSubmitted);
    counts.firstCorrectUnassisted += Number(item.firstCorrectUnassisted);
    counts.hintedItems += Number(item.hinted);
    counts.demonstratedItems += Number(item.demonstrated);
    counts.replayCount += item.replayCount;
    if (item.outcome === 'skipped') counts.skippedItems++;
    else if (item.outcome === 'unfinished') counts.unfinishedItems++;
    else if (item.outcome === 'unattempted') counts.unattemptedItems++;
    else counts.resolvedItems++;
  }
  let state: DTO['AttemptReceipt']['state'] = counts.skippedItems
    ? 'finished_with_skips'
    : 'completed';
  if (envelope.endReason === 'STOPPED') state = 'ended_early';
  return { items, counts, state, rewardKind: state === 'completed' ? settings.rewardKind : null };
}

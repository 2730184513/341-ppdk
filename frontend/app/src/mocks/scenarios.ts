export const scenarioNames = [
  'normal',
  'slow',
  'empty',
  '401',
  '403',
  '404',
  '409',
  '412',
  '422',
  '503',
  'network-error',
] as const;
export type Scenario = (typeof scenarioNames)[number];
let scenario: Scenario = 'normal';
export function setScenario(value: Scenario) {
  scenario = value;
}
export function getScenario() {
  return scenario;
}
export type OperationFault =
  | 'lost-ack'
  | 'slow'
  | 'hold'
  | 'network-error'
  | '401'
  | '403'
  | '404'
  | '409'
  | '412'
  | '422'
  | '503';
const heldOperations = new Map<string, (() => void)[]>();
export function holdOperation(operationId: string) {
  return new Promise<void>((resolve) => {
    heldOperations.set(operationId, [...(heldOperations.get(operationId) ?? []), resolve]);
  });
}
export function releaseOperation(operationId: string) {
  for (const release of heldOperations.get(operationId) ?? []) release();
  heldOperations.delete(operationId);
  clearOperationFault(operationId);
}
const FAULT_NAMESPACE = 'ppdk.mock-faults.v1';
const operationFaults = new Map<string, { fault: OperationFault; remaining: number }>();
function restoreFaults() {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem(FAULT_NAMESPACE);
  operationFaults.clear();
  if (saved)
    for (const [operation, entry] of JSON.parse(saved) as [
      string,
      { fault: OperationFault; remaining: number },
    ][])
      operationFaults.set(operation, entry);
}
function persistFaults() {
  if (typeof window !== 'undefined')
    localStorage.setItem(FAULT_NAMESPACE, JSON.stringify([...operationFaults]));
}
export function setOperationFault(operationId: string, fault: OperationFault, count = 1) {
  if (!Number.isInteger(count) || count < 1 || count > 100)
    throw new Error('Use 1–100 deterministic fault occurrences.');
  restoreFaults();
  operationFaults.set(operationId, { fault, remaining: count });
  persistFaults();
}
export async function takeOperationFault(operationId: string) {
  const claim = () => {
    restoreFaults();
    const entry = operationFaults.get(operationId);
    if (!entry) return undefined;
    if (--entry.remaining === 0) operationFaults.delete(operationId);
    persistFaults();
    return entry.fault;
  };
  if (typeof navigator !== 'undefined' && navigator.locks)
    return navigator.locks.request(FAULT_NAMESPACE, claim);
  return claim();
}
export function clearOperationFault(operationId: string) {
  restoreFaults();
  operationFaults.delete(operationId);
  persistFaults();
}

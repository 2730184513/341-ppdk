// Project normalization, not a claim of RFC8785 implementation.
export function canonical(value: unknown, key = ''): string {
  if (Array.isArray(value)) return '[' + value.map((item) => canonical(item)).join(',') + ']';
  if (value && typeof value === 'object')
    return (
      '{' +
      Object.entries(value)
        .sort(([a], [b]) => {
          if (a === b) return 0;
          return a < b ? -1 : 1;
        })
        .map(([name, item]) => JSON.stringify(name) + ':' + canonical(item, name))
        .join(',') +
      '}'
    );
  if (typeof value === 'string') {
    let normalized = value.normalize('NFC');
    if (['attemptId', 'contextId', 'deviceId', 'studentId'].includes(key))
      normalized = normalized.toLowerCase();
    if (['startedAt', 'endedAt'].includes(key)) normalized = new Date(normalized).toISOString();
    return JSON.stringify(normalized);
  }
  return JSON.stringify(value);
}

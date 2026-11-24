import type { ValidateFunction } from 'ajv';
import * as generated from '../api/validators.generated';

export function schemaErrors(name: string, body: unknown): string | null {
  const check = (generated as Record<string, ValidateFunction>)[name];
  if (!check) throw new Error('Unknown contract schema: ' + name);
  return check(body)
    ? null
    : (check.errors ?? [])
        .map((error) => `${error.instancePath || '/'} ${error.message ?? 'is invalid'}`)
        .join('; ');
}

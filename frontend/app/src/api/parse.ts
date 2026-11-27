import * as validators from './validators.generated';
import type { DTO } from './types';
import { ApiResponseError } from './errors';

/** The generated validator must succeed before the value receives its DTO type. */
export function parseDto<K extends keyof DTO>(schema: K, value: unknown): DTO[K] {
  if (!validators[schema](value)) throw new ApiResponseError(undefined, schema);
  return value as DTO[K];
}

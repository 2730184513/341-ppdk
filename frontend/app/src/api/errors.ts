import type { DTO } from './types';

/** An unreadable response is not a validated provider rejection or confirmation. */
export class ApiResponseError extends Error {
  constructor(
    public status?: number,
    public schema?: keyof DTO,
  ) {
    super('The service returned an unreadable response. Your saved work is kept. Try again.');
    this.name = 'ApiResponseError';
  }
}

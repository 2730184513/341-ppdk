import { http, HttpResponse, delay, type JsonBodyType } from 'msw';
import cases from './cases.json';
import { getScenario } from './scenarios';
export { setScenario } from './scenarios';
// Bootstrap only: static schema-valid wire responses. Stateful behavior is task B2/B4/B5.
// A scenario is consumed only by operations that actually declare that status.
export function createFixtureHandlers(origin: string) {
  return cases.map((c) => {
    const route = '/api/v1' + c.path.replace(/\{([^}]+)\}/g, ':$1');
    const make = http[c.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch'];
    return make(origin + route, async () => {
      const scenario = getScenario();
      if (scenario === 'slow') await delay(1200);
      if (scenario === 'network-error') return HttpResponse.error();
      if (/^\d{3}$/.test(scenario) && c.declaredStatuses.includes(scenario)) {
        const status = Number(scenario);
        const codes: Record<number, string> = {
          401: 'AUTH_REQUIRED',
          403: 'ROLE_FORBIDDEN',
          404: 'NOT_FOUND',
          409: 'CONTEXT_STALE',
          412: 'VERSION_MISMATCH',
          422: 'VALIDATION_FAILED',
          503: 'SERVICE_UNAVAILABLE',
        };
        return HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Mock request rejected',
            status,
            code: codes[status],
            detail: 'Deterministic Mock error; keep user input and offer the appropriate recovery.',
            requestId: '00000000-0000-4000-8000-000000000001',
          },
          {
            status,
            headers: { 'Content-Type': 'application/problem+json', 'Cache-Control': 'no-store' },
          },
        );
      }
      let body: JsonBodyType = structuredClone(c.body);
      if (
        scenario === 'empty' &&
        ['listActivities', 'listStudents', 'listAttempts'].includes(c.operationId) &&
        body &&
        typeof body === 'object' &&
        'items' in body &&
        Array.isArray(body.items)
      ) {
        body = { ...body, items: [], ...('total' in body ? { total: 0 } : {}) };
      }
      const headers = new Headers({ 'Cache-Control': 'no-store' });
      for (const [key, value] of Object.entries(c.headers))
        if (value !== undefined) headers.set(key, value);
      return c.status === 204
        ? new HttpResponse(null, { status: 204, headers })
        : HttpResponse.json(body, { status: c.status, headers });
    });
  });
}
export const handlers = createFixtureHandlers('http://localhost');

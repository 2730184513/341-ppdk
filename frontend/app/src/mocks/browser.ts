import { setupWorker } from 'msw/browser';
import { createHandlers, setScenario, setOperationFault } from './handlers';
export const worker = setupWorker(...createHandlers(window.location.origin));
export async function startMocks() {
  await worker.start({
    serviceWorker: { url: '/ppdk-worker.js' },
    onUnhandledRequest(request, print) {
      if (new URL(request.url).pathname.startsWith('/api/')) print.error();
    },
  });
  Object.assign(window, { __PPDK_MOCK__: { setScenario, setOperationFault } });
}

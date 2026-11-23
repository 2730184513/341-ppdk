import { setApiTransportGuard } from '../api/transport';
import { isMock, runtimeConfig, runtimeProblem } from './runtime';

let gateOpen = false;
let expectedController: ServiceWorker | null = null;
let validationGeneration = 0;
let problem = 'The service connection is not ready.';
setApiTransportGuard(() => {
  if (!gateOpen || navigator.serviceWorker.controller !== expectedController)
    throw new Error(problem);
});
export function runtimeStatus() {
  return { ready: gateOpen, message: problem };
}
export function assertOfflineReady() {
  if (!gateOpen || !expectedController || navigator.serviceWorker.controller !== expectedController)
    throw new Error('The offline worker is not ready. Reconnect on this device.');
}
function announce() {
  dispatchEvent(new Event('ppdk-runtime-change'));
}
function block(message: string) {
  gateOpen = false;
  problem = message;
  announce();
}
const scopeError =
  'This browser origin belongs to another app or provider. Use a separate origin or browser profile; existing data was kept.';
class IdentityTimeout extends Error {}
function message(worker: ServiceWorker, type: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const nonce = crypto.randomUUID();
    const timeout = setTimeout(() => {
      channel.port1.close();
      reject(new IdentityTimeout(scopeError));
    }, 4000);
    channel.port1.onmessage = (event: MessageEvent<Record<string, unknown>>) => {
      clearTimeout(timeout);
      channel.port1.close();
      if (event.data?.nonce !== nonce) reject(new Error(scopeError));
      else resolve(event.data);
    };
    worker.postMessage({ type, nonce }, [channel.port2]);
  });
}
function expectedPath() {
  return isMock ? '/ppdk-worker.js' : '/ppdk-live-worker.js';
}
async function identify(worker: ServiceWorker) {
  const url = new URL(worker.scriptURL);
  if (url.origin !== location.origin || url.pathname !== expectedPath())
    throw new Error(scopeError);
  if (
    (isMock && url.search !== '') ||
    (!isMock &&
      (url.searchParams.get('realm') !== runtimeConfig?.realmId ||
        [...url.searchParams.keys()].length !== 1))
  )
    throw new Error(scopeError);
  const identity = await message(worker, 'PPDK_IDENTIFY');
  if (
    identity.mode !== runtimeConfig?.apiMode ||
    identity.realm !== runtimeConfig?.realmId ||
    identity.version !== 2
  )
    throw new Error(scopeError);
}
async function waitState(worker: ServiceWorker, target: 'installed' | 'activated') {
  if (worker.state === target) return;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      worker.removeEventListener('statechange', check);
      reject(new Error('The offline worker did not reach the required state.'));
    }, 10000);
    function check() {
      if (worker.state === target) {
        clearTimeout(timer);
        worker.removeEventListener('statechange', check);
        resolve();
      } else if (
        worker.state === 'redundant' ||
        (target === 'installed' && worker.state === 'activated')
      ) {
        clearTimeout(timer);
        worker.removeEventListener('statechange', check);
        reject(new Error('The offline worker changed unexpectedly.'));
      }
    }
    worker.addEventListener('statechange', check);
    check();
  });
}
async function candidateForLegacy(registration: ServiceWorkerRegistration) {
  let worker = registration.waiting ?? registration.installing;
  if (!worker) {
    let resolveFound!: (candidate: ServiceWorker) => void;
    let rejectFound!: (reason: Error) => void;
    const found = new Promise<ServiceWorker>((resolve, reject) => {
      resolveFound = resolve;
      rejectFound = reject;
    });
    const check = () => {
      const candidate = registration.waiting ?? registration.installing;
      if (candidate) resolveFound(candidate);
    };
    const timer = setTimeout(
      () => rejectFound(new Error('A safe Mock worker update was not available.')),
      10000,
    );
    registration.addEventListener('updatefound', check);
    try {
      await registration.update();
      check();
      worker = await found;
    } finally {
      clearTimeout(timer);
      registration.removeEventListener('updatefound', check);
    }
  }
  await waitState(worker, 'installed');
  if (registration.waiting !== worker)
    throw new Error('The Mock worker update is not waiting safely.');
  return worker;
}
async function waitController(worker: ServiceWorker) {
  if (navigator.serviceWorker.controller === worker) return;
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      navigator.serviceWorker.removeEventListener('controllerchange', check);
      reject(new Error('The offline worker could not control this page.'));
    }, 10000);
    function check() {
      if (navigator.serviceWorker.controller === worker) {
        clearTimeout(timer);
        navigator.serviceWorker.removeEventListener('controllerchange', check);
        resolve();
      }
    }
    navigator.serviceWorker.addEventListener('controllerchange', check);
    check();
  });
}
async function revalidateController() {
  const generation = ++validationGeneration;
  const worker = navigator.serviceWorker.controller;
  if (!worker) {
    block('The service worker changed. Reopen this page on the original origin.');
    return;
  }
  try {
    await identify(worker);
    if (generation !== validationGeneration || navigator.serviceWorker.controller !== worker)
      return;
    expectedController = worker;
    gateOpen = true;
    problem = '';
    announce();
  } catch (error) {
    if (generation !== validationGeneration || navigator.serviceWorker.controller !== worker)
      return;
    block(error instanceof Error ? error.message : scopeError);
  }
}
export async function startRuntime() {
  const invalid = runtimeProblem();
  if (invalid || !runtimeConfig) throw new Error(invalid ?? 'Invalid runtime configuration.');
  const config = runtimeConfig;
  if (!('serviceWorker' in navigator) || !navigator.locks)
    throw new Error('This browser cannot safely prepare offline access.');
  const binding = `${config.apiMode}:${config.realmId}`;
  const prior = localStorage.getItem('ppdk.origin-binding.v2');
  if (prior && prior !== binding) throw new Error(scopeError);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    block('The service worker changed; checking the connection.');
    void revalidateController();
  });
  await navigator.locks.request('ppdk.runtime-registration.v2', async () => {
    let registration = await navigator.serviceWorker.getRegistration('/');
    let legacy = false;
    if (registration) {
      if (registration.scope !== new URL('/', location.href).href) throw new Error(scopeError);
      for (const candidate of [
        registration.active,
        registration.waiting,
        registration.installing,
      ]) {
        if (!candidate) continue;
        try {
          await identify(candidate);
        } catch (error) {
          const url = new URL(candidate.scriptURL);
          const eligible =
            candidate === registration.active &&
            isMock &&
            config.realmId === 'default' &&
            url.origin === location.origin &&
            url.pathname === '/ppdk-worker.js' &&
            url.search === '' &&
            error instanceof IdentityTimeout;
          if (!eligible) throw error;
          legacy = true;
        }
      }
    } else {
      const url = expectedPath() + (isMock ? '' : `?realm=${encodeURIComponent(config.realmId)}`);
      registration = await navigator.serviceWorker.register(url, {
        scope: '/',
        updateViaCache: 'none',
      });
    }
    let active: ServiceWorker;
    const waiting = legacy ? await candidateForLegacy(registration) : registration.waiting;
    if (waiting) {
      await waitState(waiting, 'installed');
      if (registration.waiting !== waiting)
        throw new Error('The worker update is not waiting safely.');
      await identify(waiting);
      const result = await message(waiting, 'PPDK_ACTIVATE_IF_SOLE');
      if (!result.allowed)
        throw new Error(
          'An update is waiting while another page is open. Keep that page and finish its work before reopening.',
        );
      await waitState(waiting, 'activated');
      active = waiting;
    } else {
      const initial = registration.active ?? registration.installing;
      if (!initial) throw new Error('The offline worker did not install.');
      await waitState(initial, 'activated');
      active = initial;
    }
    await identify(active);
    let controller = navigator.serviceWorker.controller;
    if (controller !== active) {
      const claim = await message(active, 'PPDK_CLAIM_IF_SOLE');
      if (claim.allowed) {
        await waitController(active);
        controller = navigator.serviceWorker.controller;
      } else if (isMock || controller)
        throw new Error('Another page is open. Finish its work before preparing this page.');
    }
    if (controller) await identify(controller);
    if (isMock && controller !== active)
      throw new Error('The verified Mock worker is not controlling this page.');
    expectedController = controller;
    localStorage.setItem('ppdk.origin-binding.v2', binding);
    gateOpen = true;
    problem = '';
    announce();
  });
}

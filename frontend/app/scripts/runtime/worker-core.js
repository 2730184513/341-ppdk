// Runtime identity and lifecycle are shared by the generated mode-specific workers.
const ppdkParams = new URL(self.location.href).searchParams;
const ppdkRealm = PPDK_WORKER_MODE === 'mock' ? 'default' : ppdkParams.get('realm');
const ppdkSuffix = PPDK_WORKER_MODE === 'mock' ? '' : `.local-live.${ppdkRealm}`;
const ppdkShellCache = 'ppdk.app-shell.v1' + ppdkSuffix;
const ppdkUiCache = 'ppdk.ui-art.v1' + ppdkSuffix;
addEventListener('install', (event) => {
  event.stopImmediatePropagation();
});
addEventListener('activate', (event) => {
  event.stopImmediatePropagation();
});
addEventListener('message', (event) => {
  const data = event.data;
  if (data?.type === 'PPDK_IDENTIFY' && event.ports[0]) {
    event.stopImmediatePropagation();
    event.ports[0].postMessage({
      nonce: data.nonce,
      mode: PPDK_WORKER_MODE,
      realm: ppdkRealm,
      version: 2,
    });
    return;
  }
  if (
    (data?.type === 'PPDK_ACTIVATE_IF_SOLE' || data?.type === 'PPDK_CLAIM_IF_SOLE') &&
    event.ports[0]
  ) {
    event.stopImmediatePropagation();
    event.waitUntil(
      (async () => {
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const allowed = clients.length === 1 && clients[0].id === event.source?.id;
        if (allowed && data.type === 'PPDK_ACTIVATE_IF_SOLE') await self.skipWaiting();
        if (allowed && data.type === 'PPDK_CLAIM_IF_SOLE') await self.clients.claim();
        event.ports[0].postMessage({ nonce: data.nonce, allowed });
      })(),
    );
    return;
  }
  if (PPDK_WORKER_MODE === 'mock' && data === 'CLIENT_CLOSED') {
    event.stopImmediatePropagation();
    const clientId = Reflect.get(event.source || {}, 'id');
    if (clientId) activeClientIds.delete(clientId);
  }
});
addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const navigation = event.request.mode === 'navigate';
  const appAsset =
    /^\/(assets|src|node_modules|@vite|@react-refresh)\//.test(url.pathname) ||
    url.pathname === '/@react-refresh';
  const shellRoute = /^\/(?:$|login(?:\/|$)|teacher(?:\/|$)|learn(?:\/|$))/.test(url.pathname);
  const uiImage = appAsset && url.pathname.endsWith('.png') && !url.searchParams.has('import');
  if (
    url.origin !== self.location.origin ||
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    (!appAsset && !(navigation && shellRoute))
  )
    return;
  event.stopImmediatePropagation();
  event.respondWith(
    (async () => {
      const cache = await caches.open(uiImage ? ppdkUiCache : ppdkShellCache);
      const cacheKey = new URL(event.request.url);
      const verificationFetch = cacheKey.searchParams.has('ppdk-ui-verify');
      if (verificationFetch) cacheKey.searchParams.delete('ppdk-ui-verify');
      if (uiImage && !verificationFetch && event.request.cache !== 'no-store') {
        const prepared = await cache.match(cacheKey.href, { ignoreVary: true });
        if (prepared) return prepared;
      }
      try {
        const response = await fetch(event.request);
        if (response.ok && !uiImage) {
          let eligible = true;
          if (navigation) {
            eligible =
              response.headers.get('content-type')?.includes('text/html') &&
              (await response.clone().text()).includes(
                `name="ppdk-runtime" content="${PPDK_WORKER_MODE}:${ppdkRealm}"`,
              );
          }
          if (eligible)
            await cache.put(navigation ? '/index.html' : event.request, response.clone());
        }
        return response;
      } catch {
        const cached = await cache.match(navigation ? '/index.html' : cacheKey.href, {
          ignoreVary: true,
        });
        return (
          cached ??
          new Response('This app is not prepared offline. Reconnect on the original device.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          })
        );
      }
    })(),
  );
});

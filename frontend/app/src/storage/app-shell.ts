import { assertOfflineReady } from '../config/worker-runtime';
import { runtimeConfig } from '../config/runtime';
import { realmName } from './realm';
import { prepareUiAssets } from './ui-assets';
import { artworkAssets } from '../components/artwork-assets';
const SHELL_CACHE = realmName('ppdk.app-shell.v1');
export async function prepareAppShell() {
  assertOfflineReady();
  const cache = await caches.open(SHELL_CACHE);
  const shell = await fetch('/', { cache: 'no-store' });
  if (
    !shell.ok ||
    !shell.headers.get('content-type')?.includes('text/html') ||
    !(await shell.clone().text()).includes(
      `name="ppdk-runtime" content="${runtimeConfig?.apiMode}:${runtimeConfig?.realmId}"`,
    )
  )
    throw new Error('The app could not be prepared for reopening offline.');
  await cache.put('/index.html', shell);
  await prepareUiAssets();
  const uiUrls = new Set(
    Object.values(artworkAssets).map((asset) => new URL(asset.src, location.href).href),
  );
  const urls = new Set(performance.getEntriesByType('resource').map((entry) => entry.name));
  for (const value of urls) {
    const url = new URL(value);
    const assetIdentity = new URL(value);
    if (assetIdentity.searchParams.has('ppdk-ui-verify'))
      assetIdentity.searchParams.delete('ppdk-ui-verify');
    if (
      url.origin !== location.origin ||
      uiUrls.has(assetIdentity.href) ||
      (!/^\/(assets|src|node_modules|@vite|@react-refresh)\//.test(url.pathname) &&
        url.pathname !== '/@react-refresh')
    )
      continue;
    const response = await fetch(url.href);
    if (!response.ok) throw new Error('App resource could not be cached: ' + url.pathname);
    await cache.put(url.href, response);
  }
}

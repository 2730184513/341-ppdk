import { realmName } from './realm';
import { artworkAssets } from '../components/artwork-assets';

export async function prepareUiAssets() {
  const cache = await caches.open(realmName('ppdk.ui-art.v1'));
  for (const [id, asset] of Object.entries(artworkAssets)) {
    async function verify(response: Response) {
      if (!response.ok) throw new Error('Picture unavailable: ' + id);
      const bytes = await response.clone().arrayBuffer();
      const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
      if (digest !== asset.sha256) throw new Error('Picture integrity mismatch: ' + id);
      const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
      const validSize = bitmap.width === asset.width && bitmap.height === asset.height;
      bitmap.close();
      if (!validSize) throw new Error('Picture dimensions do not match: ' + id);
    }
    const cached = await cache.match(asset.src, { ignoreVary: true });
    if (cached) {
      try {
        await verify(cached);
        continue;
      } catch {
        /* Replace only this damaged UI entry after fresh bytes verify. */
      }
    }
    // Explicitly bypass prepared bytes during repair, even if tooling normalizes request.cache.
    const fresh = new URL(asset.src, location.href);
    fresh.searchParams.set('ppdk-ui-verify', asset.sha256);
    const response = await fetch(fresh, { cache: 'no-store' });
    await verify(response);
    await cache.put(asset.src, response);
  }
}

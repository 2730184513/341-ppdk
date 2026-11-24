import type { Bundle } from '../api/types';
import { decodeAudio } from '../media/audio';
import { CONTENT_CACHE } from '../media/content-cache';

export async function prepareResources(
  bundle: Bundle,
  onProgress: (ready: number, total: number) => void,
) {
  const resources = [
    ...new Map(
      bundle.activities
        .flatMap((activity) => activity.resources)
        .map((resource) => [resource.url, resource]),
    ).values(),
  ];
  const cache = await caches.open(CONTENT_CACHE);
  let ready = 0;
  for (const resource of resources) {
    const cached = await cache.match(resource.url);
    async function verify(response: Response) {
      if (!response.ok) throw new Error('Resource unavailable: ' + resource.url);
      const bytes = await response.clone().arrayBuffer();
      const hash = Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
        (byte) => byte.toString(16).padStart(2, '0'),
      ).join('');
      if (bytes.byteLength !== resource.bytes || hash !== resource.sha256)
        throw new Error('Resource integrity mismatch: ' + resource.url);
      if (resource.url.endsWith('.wav')) await decodeAudio(resource.url, bytes);
    }
    if (cached) {
      try {
        await verify(cached);
        onProgress(++ready, resources.length);
        continue;
      } catch {
        // Replace only this damaged entry, and only after the new bytes verify.
      }
    }
    const response = await fetch(resource.url, { cache: 'no-store' });
    await verify(response);
    await cache.put(resource.url, response);
    onProgress(++ready, resources.length);
  }
}

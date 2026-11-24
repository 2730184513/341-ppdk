import { contentResponse } from './content-cache';
let context: AudioContext | undefined;
let source: AudioBufferSourceNode | undefined;
let generation = 0;
const decoded = new Map<string, AudioBuffer>();
function audioContext() {
  context ??= new AudioContext();
  return context;
}
export async function decodeAudio(url: string, bytes: ArrayBuffer) {
  decoded.set(url, await audioContext().decodeAudioData(bytes.slice(0)));
}
export async function playAudio(url: string) {
  const requestedAt = performance.now();
  const requestGeneration = ++generation;
  const ctx = audioContext();
  await ctx.resume();
  if (ctx.state !== 'running') throw new Error('Audio playback was not enabled.');
  if (!decoded.has(url)) {
    const response = await contentResponse(url);
    if (!response.ok) throw new Error('Audio is unavailable.');
    await decodeAudio(url, await response.arrayBuffer());
  }
  if (requestGeneration !== generation) throw new DOMException('Playback cancelled.', 'AbortError');
  stopCurrentSource();
  source = ctx.createBufferSource();
  source.buffer = decoded.get(url)!;
  source.connect(ctx.destination);
  const scheduledAt = performance.now();
  source.start(ctx.currentTime);
  const metrics = window as unknown as { __PPDK_AUDIO__?: { url: string; ms: number }[] };
  metrics.__PPDK_AUDIO__ ??= [];
  metrics.__PPDK_AUDIO__.push({ url, ms: scheduledAt - requestedAt });
  return scheduledAt;
}
export function stopAudio() {
  generation++;
  stopCurrentSource();
}
function stopCurrentSource() {
  if (source) {
    source.stop();
    source.disconnect();
    source = undefined;
  }
}

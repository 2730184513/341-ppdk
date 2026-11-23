import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
const walk = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
    );
const files = walk('dist-live');
for (const file of files)
  if (/(^|[\\/])(ppdk-worker|mockServiceWorker)\.js$/.test(file))
    throw Error('Live output contains a Mock worker: ' + file);
if (!fs.existsSync('dist-live/ppdk-live-worker.js')) throw Error('Live worker is missing.');
const graph = JSON.parse(fs.readFileSync('dist-live/ppdk-live-graph.json', 'utf8'));
if (graph.some((id) => /(?:^|\/)(?:mocks|msw|features\/dev)(?:\/|$)/.test(id)))
  throw Error('Live module graph contains Mock code.');
const sourceContent = walk('public/content');
for (const source of sourceContent) {
  const target = path.join('dist-live', path.relative('public', source));
  if (!fs.existsSync(target) || !fs.readFileSync(source).equals(fs.readFileSync(target)))
    throw Error('Content differs from the frozen source: ' + source);
}
const size = (ext) =>
  files
    .filter((file) => file.endsWith(ext))
    .reduce((total, file) => total + gzipSync(fs.readFileSync(file)).length, 0);
const jsGzipBytes = size('.js');
const cssGzipBytes = size('.css');
if (jsGzipBytes > 300 * 1024 || cssGzipBytes > 50 * 1024)
  throw Error('Live bundle exceeds existing gzip limits.');
console.log(
  JSON.stringify({
    modules: graph.length,
    contentFiles: sourceContent.length,
    jsGzipBytes,
    cssGzipBytes,
    noMockWorkerOrGraph: true,
  }),
);

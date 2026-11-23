import fs from 'node:fs';
const source = fs.readFileSync('scripts/runtime/worker-core.js', 'utf8');
const vendor = fs.readFileSync('public/mockServiceWorker.js', 'utf8');
for (const text of [
  "case 'CLIENT_CLOSED'",
  'const activeClientIds = new Set()',
  "addEventListener('install', function () {\n  self.skipWaiting()",
  "addEventListener('activate', function (event) {\n  event.waitUntil(self.clients.claim())",
])
  if (!vendor.includes(text))
    throw new Error('MSW lifecycle protocol changed; review before generation.');
for (const [mode, name] of [
  ['mock', 'ppdk-worker.js'],
  ['local-live', 'ppdk-live-worker.js'],
]) {
  const tail = mode === 'mock' ? "\nimportScripts('./mockServiceWorker.js');\n" : '\n';
  fs.writeFileSync(
    'public/' + name,
    '// Generated; do not edit.\nconst PPDK_WORKER_MODE = ' +
      JSON.stringify(mode) +
      ';\n' +
      source +
      tail,
  );
}
console.log('Generated mode-specific workers with owned lifecycle and unchanged MSW vendor.');

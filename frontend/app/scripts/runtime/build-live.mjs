import { spawnSync } from 'node:child_process';
if (
  !process.env.PPDK_PROVIDER_REALM ||
  !/^[a-z][a-z0-9-]{2,62}$/.test(process.env.PPDK_PROVIDER_REALM)
)
  throw Error('Set PPDK_PROVIDER_REALM to a stable public provider identity.');
const env = { ...process.env, PPDK_RUNTIME_MODE: 'local-live' };
for (const args of [
  ['scripts/prepare-output.mjs', 'dist-live'],
  ['node_modules/typescript/bin/tsc', '--noEmit'],
  ['node_modules/vite/bin/vite.js', 'build'],
  ['scripts/check-live-build.mjs'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

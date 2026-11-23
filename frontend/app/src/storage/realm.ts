import { runtimeConfig } from '../config/runtime';

/** Default Mock retains historic device data; other modes use stable public namespaces. */
export function realmName(legacyName: string): string {
  if (!runtimeConfig) return 'ppdk.invalid-runtime';
  return runtimeConfig.apiMode === 'mock'
    ? legacyName
    : `${legacyName}.${runtimeConfig.apiMode}.${runtimeConfig.realmId}`;
}

declare global {
  const __PPDK_BUILD_MODE__: string;
  const __PPDK_PROVIDER_REALM__: string;
}
export type ApiMode = 'mock' | 'local-live';
export type RuntimeConfig = { apiMode: ApiMode; realmId: string };
export type RawRuntimeConfig = { apiMode: string; realmId: string };
export const rawRuntimeConfig: RawRuntimeConfig = {
  apiMode: __PPDK_BUILD_MODE__,
  realmId: __PPDK_PROVIDER_REALM__,
};
export function runtimeProblem(): string | undefined {
  const { apiMode, realmId } = rawRuntimeConfig;
  if (apiMode !== 'mock' && apiMode !== 'local-live') return 'Unknown runtime mode.';
  if (apiMode === 'mock' && realmId !== 'default')
    return 'This Mock build supports only the default realm.';
  if (apiMode === 'local-live' && !/^[a-z][a-z0-9-]{2,62}$/.test(realmId))
    return 'A stable provider identity is required for this local connection.';
  return undefined;
}
export const runtimeConfig: RuntimeConfig | undefined = runtimeProblem()
  ? undefined
  : (rawRuntimeConfig as RuntimeConfig);
export const isMock = runtimeConfig?.apiMode === 'mock';

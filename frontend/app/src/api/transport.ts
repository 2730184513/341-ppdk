let guard: (() => void) | undefined;

/** Bootstrap owns the controller check; all requests use the same readiness gate. */
export function setApiTransportGuard(check: (() => void) | undefined) {
  guard = check;
}

export function assertApiTransportReady() {
  guard?.();
}

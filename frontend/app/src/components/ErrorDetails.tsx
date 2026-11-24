import type { ReactNode } from 'react';
/** Presentation only: recovery is chosen from the actual error status, never from message text. */
export function ErrorDetails({ error }: { error: Error & { status?: number } }): ReactNode {
  return (
    <>
      <span>{error.message}</span>
      {[401, 403].includes(error.status ?? 0) && (
        <>
          {' '}
          <a className="button secondary" href="/login?reauth=1">
            Sign in again
          </a>
        </>
      )}
    </>
  );
}

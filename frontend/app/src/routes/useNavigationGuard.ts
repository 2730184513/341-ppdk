import { useEffect, useRef } from 'react';
/** Prevent SPA links/history from leaving a controller while its local write or outcome is unresolved. */
export type NavigationIntent = { path: string; replace?: boolean; resume?: () => void };
export function useNavigationGuard(
  shouldBlock: () => boolean,
  onBlocked: (intent?: NavigationIntent) => void,
) {
  const block = useRef(shouldBlock);
  const notify = useRef(onBlocked);
  block.current = shouldBlock;
  notify.current = onBlocked;
  useEffect(() => {
    const before = (event: Event) => {
      if (block.current()) {
        event.preventDefault();
        notify.current((event as CustomEvent<NavigationIntent>).detail);
      }
    };
    addEventListener('ppdk-before-navigate', before);
    return () => {
      removeEventListener('ppdk-before-navigate', before);
    };
  }, []);
}

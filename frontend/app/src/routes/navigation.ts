import { useEffect, useRef, useState } from 'react';
export function requestNavigation(intent: {
  path: string;
  replace?: boolean;
  resume?: () => void;
}) {
  return dispatchEvent(
    new CustomEvent('ppdk-before-navigate', { cancelable: true, detail: intent }),
  );
}
function historyIndex(): number | undefined {
  const value = history.state?.ppdkEntry;
  return Number.isInteger(value) ? value : undefined;
}
export function navigate(path: string, replace = false) {
  if (!requestNavigation({ path, replace })) return;
  const current = historyIndex() ?? 0;
  if (historyIndex() === undefined) history.replaceState({ ppdkEntry: current }, '');
  if (replace) history.replaceState({ ppdkEntry: current }, '', path);
  else history.pushState({ ppdkEntry: current + 1 }, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}
export function useLocation() {
  const [path, setPath] = useState(location.pathname + location.search);
  const committed = useRef({ path, index: historyIndex() ?? 0 });
  useEffect(() => {
    if (historyIndex() === undefined)
      history.replaceState({ ppdkEntry: committed.current.index }, '');
    let restoring = false;
    const change = (event: PopStateEvent) => {
      const next = location.pathname + location.search;
      const index = historyIndex();
      if (restoring) {
        if (next === committed.current.path && index === committed.current.index) restoring = false;
        else if (index !== undefined) history.go(committed.current.index - index);
        return;
      }
      // Ask before React unmounts the current controller. Restore by traversal,
      // retaining the destination entry for Stay / repeated Back / Forward.
      if (event.isTrusted && next !== committed.current.path) {
        const delta = index === undefined ? undefined : index - committed.current.index;
        const resume = () => (delta ? history.go(delta) : navigate(next, true));
        if (!requestNavigation({ path: next, replace: true, resume })) {
          if (delta) {
            restoring = true;
            history.go(-delta);
          } else
            history.pushState({ ppdkEntry: committed.current.index }, '', committed.current.path);
          return;
        }
      }
      committed.current = { path: next, index: index ?? committed.current.index };
      setPath(next);
    };
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      const anchor = (event.target as Element).closest('a');
      if (
        !anchor ||
        anchor.target ||
        anchor.download ||
        anchor.origin !== location.origin ||
        anchor.hash
      )
        return;
      event.preventDefault();
      navigate(anchor.pathname + anchor.search);
    };
    window.addEventListener('popstate', change);
    document.addEventListener('click', click);
    return () => {
      window.removeEventListener('popstate', change);
      document.removeEventListener('click', click);
    };
  }, []);
  return path;
}

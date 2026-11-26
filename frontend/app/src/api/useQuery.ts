import { useCallback, useEffect, useRef, useState } from 'react';
export function useQuery<T>(key: string, load: () => Promise<T>) {
  const loader = useRef(load);
  loader.current = load;
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ key?: string; data?: T; error?: Error; loading: boolean }>({
    loading: true,
  });
  useEffect(() => {
    let alive = true;
    setState({ key, loading: true });
    void loader.current().then(
      (data) => {
        if (alive) setState({ key, data, loading: false });
      },
      (error) => {
        if (alive)
          setState({
            key,
            error: error instanceof Error ? error : new Error('Unable to load this information.'),
            loading: false,
          });
      },
    );
    return () => {
      alive = false;
    };
  }, [key, revision]);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  return { ...(state.key === key ? state : { loading: true }), reload };
}

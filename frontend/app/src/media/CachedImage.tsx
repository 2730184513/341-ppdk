import { useEffect, useRef, useState } from 'react';
import { contentResponse } from './content-cache';

export function CachedImage({ url, onFailure }: { url: string; onFailure?: () => void }) {
  const [image, setImage] = useState<{ original: string; source: string; error: boolean }>();
  const failure = useRef(onFailure);
  failure.current = onFailure;
  useEffect(() => {
    let alive = true;
    let objectUrl: string | undefined;
    void contentResponse(url)
      .then((response) => response.blob())
      .then((blob) => {
        if (!alive) return;
        objectUrl = URL.createObjectURL(blob);
        setImage({ original: url, source: objectUrl, error: false });
      })
      .catch(() => {
        if (!alive) return;
        setImage({ original: url, source: '', error: true });
        failure.current?.();
      });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);
  const current = image?.original === url ? image : undefined;
  return (
    <img
      src={current?.source || undefined}
      alt={current?.error ? 'Picture unavailable. Ask an adult for help.' : ''}
      width="240"
      height="200"
      onError={(event) => {
        if (!current?.source || event.currentTarget.getAttribute('src') !== current.source) return;
        setImage({ original: url, source: '', error: true });
        failure.current?.();
      }}
    />
  );
}

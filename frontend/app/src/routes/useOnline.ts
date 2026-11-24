import { useEffect, useState } from 'react';
export function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const change = () => setOnline(navigator.onLine);
    addEventListener('online', change);
    addEventListener('offline', change);
    return () => {
      removeEventListener('online', change);
      removeEventListener('offline', change);
    };
  }, []);
  return online;
}

import { PageFrame } from './components/PageFrame';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { onCLS, onINP, onLCP } from 'web-vitals';
import './styles.css';
import { Notice } from './components/ui';
import { runtimeStatus, startRuntime } from './config/worker-runtime';
import { runtimeProblem } from './config/runtime';

const metrics: unknown[] = [];
Object.assign(window, { __PPDK_VITALS__: metrics });
for (const collect of [onCLS, onINP, onLCP]) collect((metric) => metrics.push(metric));
let startup: Promise<void> | undefined;
function Bootstrap() {
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState(runtimeStatus);
  useEffect(() => {
    const change = () => setStatus(runtimeStatus());
    addEventListener('ppdk-runtime-change', change);
    return () => removeEventListener('ppdk-runtime-change', change);
  }, []);
  const [error, setError] = useState(runtimeProblem);
  useEffect(() => {
    let alive = true;
    startup ??= new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }).then(async () => {
      await startRuntime();
      if (__PPDK_BUILD_MODE__ === 'mock') await (await import('./mocks/browser')).startMocks();
    });
    void startup.then(
      () => {
        if (alive) setReady(true);
      },
      (reason) => {
        if (alive)
          setError(
            reason instanceof Error ? reason.message : 'The local connection could not start.',
          );
      },
    );
    return () => {
      alive = false;
    };
  }, []);
  if (error)
    return (
      <PageFrame className="teacher-main">
        <Notice title="Connection unavailable" tone="danger">
          {error}
        </Notice>
      </PageFrame>
    );
  return (
    <>
      {ready && !status.ready && (
        <Notice title="Connection paused" tone="warning">
          {status.message} Your current work remains open.
        </Notice>
      )}
      <App initializing={!ready} />
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>,
);

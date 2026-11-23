import { PageFrame } from './components/PageFrame';
import { RouteErrorBoundary } from './components/RouteErrorBoundary';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { Session } from './api/types';
import { useSession } from './session/useSession';
import { Button } from './components/Button';
import { Notice } from './components/ui';
import { navigate, useLocation } from './routes/navigation';
import { Login } from './features/teacher/Login';
import { syncQueue } from './storage/sync';
import { useQuery } from './api/useQuery';
import { adultContextKey, readAdultContext } from './storage/session-handover';
const AdultHelp = lazy(() =>
  import('./features/adult/AdultHelp').then((module) => ({ default: module.AdultHelp })),
);
const TeacherArea = lazy(() => import('./features/teacher/TeacherArea'));
const LearnerArea = lazy(() => import('./features/learning/LearnerArea'));
const DevPage =
  __PPDK_BUILD_MODE__ === 'mock' && import.meta.env.DEV
    ? lazy(() => import('./features/dev/DevPage').then((module) => ({ default: module.DevPage })))
    : undefined;
export function App({ initializing = false }: { initializing?: boolean }) {
  const path = useLocation();
  const { session, error, applySession, refresh } = useSession();
  const [bindingRevision, setBindingRevision] = useState(0);
  const adult = useQuery('adult-binding:' + bindingRevision, readAdultContext);
  useEffect(() => {
    const change = (event: Event) => {
      const keys = (event as CustomEvent<string[]>).detail;
      if (keys?.includes(adultContextKey)) setBindingRevision((value) => value + 1);
    };
    addEventListener('ppdk-storage', change);
    return () => removeEventListener('ppdk-storage', change);
  }, []);
  useEffect(() => {
    if (!initializing) void refresh();
  }, [initializing]);
  useEffect(() => {
    if (!session || session.mode === 'ANONYMOUS') return;
    const run = () => {
      void syncQueue(session).catch(console.error);
    };
    run();
    const timer = setInterval(run, 1200);
    addEventListener('online', run);
    return () => {
      clearInterval(timer);
      removeEventListener('online', run);
    };
  }, [session]);
  useEffect(() => {
    if (!session || adult.loading || adult.error) return;
    const pathname = path.split('?')[0];
    if (adult.data) {
      if (pathname !== '/learn/teacher') navigate('/learn/teacher', true);
      return;
    }
    if (session.mode === 'ANONYMOUS' && pathname !== '/login') navigate('/login', true);
    const reauth = new URLSearchParams(path.split('?')[1]).get('reauth') === '1';
    if (session.mode === 'TEACHER' && (pathname === '/' || (pathname === '/login' && !reauth)))
      navigate('/teacher/students', true);
    if (session.mode === 'LEARNER' && !pathname.startsWith('/learn')) navigate('/learn', true);
  }, [session, path, adult.loading, adult.error, adult.data]);
  if (error)
    return (
      <PageFrame className="teacher-main">
        <Notice
          title="Session check unavailable"
          tone="warning"
          action={<Button onClick={() => void refresh()}>Retry session check</Button>}
        >
          {error}
        </Notice>
      </PageFrame>
    );
  if (adult.error)
    return (
      <PageFrame className="teacher-main">
        <Notice
          title="Saved session check unavailable"
          action={<Button onClick={adult.reload}>Retry saved session</Button>}
        >
          {adult.error.message}
        </Notice>
      </PageFrame>
    );
  if (session && adult.data)
    return (
      <Suspense
        fallback={
          <PageFrame className="teacher-main">
            <p role="status">Opening teacher help…</p>
          </PageFrame>
        }
      >
        <AdultHelp local={adult.data} session={session} onSession={applySession} />
      </Suspense>
    );
  if (adult.loading)
    return (
      <PageFrame className="teacher-main">
        <p role="status">Checking this device’s session…</p>
      </PageFrame>
    );
  if (!session && ['/', '/login'].includes(path.split('?')[0]))
    return <Login initializing onSession={applySession} />;
  if (!session)
    return (
      <PageFrame className="teacher-main">
        <p role="status">Opening PPDK Learning…</p>
      </PageFrame>
    );
  if (path.split('?')[0] === '/login' || session.mode === 'ANONYMOUS')
    return <Login onSession={applySession} />;
  let content = (
    <LearnerArea session={session as Extract<Session, { mode: 'LEARNER' }>} path={path} />
  );
  if (session.mode === 'TEACHER')
    content = (
      <TeacherArea
        key={session.teacherId}
        teacherId={session.teacherId}
        path={path}
        onSession={applySession}
        expiresAt={session.expiresAt}
      />
    );
  if (DevPage && path.startsWith('/dev') && session.mode === 'TEACHER') content = <DevPage />;
  return (
    <RouteErrorBoundary key={path.split('?')[0]}>
      <Suspense
        fallback={
          <PageFrame className="teacher-main">
            <p role="status">Opening this view…</p>
          </PageFrame>
        }
      >
        {content}
      </Suspense>
    </RouteErrorBoundary>
  );
}

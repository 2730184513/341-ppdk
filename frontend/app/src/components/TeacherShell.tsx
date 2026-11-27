import { isMock } from '../config/runtime';
import { PageFrame } from './PageFrame';
import type { ReactNode } from 'react';
import { Popover } from './ui';
import { Button } from './Button';
export function TeacherShell({
  children,
  active = 'Students',
  onLogout,
  expiresAt,
  logoutDisabled = false,
  logoutPending = false,
}: {
  children: ReactNode;
  active?: string;
  onLogout: () => void;
  expiresAt?: string;
  logoutDisabled?: boolean;
  logoutPending?: boolean;
}) {
  const links = [
    { label: 'Students', href: '/teacher/students' },
    { label: 'Activities', href: '/teacher/activities' },
    { label: 'Sync', href: '/teacher/sync' },
  ];
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="teacher-header">
        <a className="brand" href="/teacher/students">
          PPDK Learning
        </a>
        <nav aria-label="Main navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={active === link.label ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="account">
          <Popover label="Teacher session" surfaceId="S-01" icon="teacher" showLabel>
            <p>{isMock ? 'Mock teacher session' : 'Teacher session'}</p>
            <p>
              Session expires:{' '}
              {expiresAt ? (
                <time dateTime={expiresAt}>
                  {new Intl.DateTimeFormat('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: 'Asia/Kuala_Lumpur',
                  }).format(new Date(expiresAt))}{' '}
                  (UTC+8)
                </time>
              ) : (
                'Unknown in this preview'
              )}
            </p>
            <p className="muted">Signing out keeps saved learning records on this device.</p>
            <Button
              variant="secondary"
              disabled={logoutDisabled}
              pending={logoutPending}
              onClick={(event) => {
                const menu = event.currentTarget.closest('details');
                if (menu) menu.open = false;
                onLogout();
              }}
            >
              Sign out
            </Button>
          </Popover>
        </div>
      </header>
      <PageFrame id="main" className="teacher-main">
        {children}
      </PageFrame>
      <footer className="teacher-footer">
        PPDK Learning{' '}
        <span>{isMock ? 'Mock prototype · This browser only' : 'This browser only'}</span>
      </footer>
    </>
  );
}

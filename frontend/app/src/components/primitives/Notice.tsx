import type { ReactNode } from 'react';
import { Icon } from '../Icon';

export function Notice({
  title,
  children,
  tone = 'info',
  action,
}: {
  title: string;
  children?: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  action?: ReactNode;
}) {
  let artwork = 'info';
  if (tone === 'success') artwork = 'check';
  if (tone === 'warning' || tone === 'danger') artwork = 'warning';
  return (
    <div className={`notice ${tone}`} role={tone === 'danger' ? 'alert' : undefined}>
      <span className="notice-icon">
        <Icon name={artwork} />
      </span>
      <div>
        <strong>{title}</strong>
        {children && <div>{children}</div>}
        {action}
      </div>
    </div>
  );
}

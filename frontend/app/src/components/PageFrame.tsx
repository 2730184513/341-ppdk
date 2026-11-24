import type { ComponentPropsWithoutRef } from 'react';

export function PageFrame({ className = '', ...props }: ComponentPropsWithoutRef<'main'>) {
  return <main {...props} data-frame="page" className={`page-frame ${className}`} />;
}

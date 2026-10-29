import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StickyActionBarProps {
  children: ReactNode;
  className?: string;
}

export const StickyActionBar = ({ children, className }: StickyActionBarProps) => (
  <div
    className={cn(
      'fixed left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-slate-200 bg-white px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] shadow-[0_-6px_24px_rgba(15,23,42,0.08)]',
      'bottom-[var(--host-bottom-offset,0px)]',
      className
    )}
  >
    {children}
  </div>
);

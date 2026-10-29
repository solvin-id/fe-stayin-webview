import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StickyActionBarProps {
  children: ReactNode;
  className?: string;
}

export const StickyActionBar = ({ children, className }: StickyActionBarProps) => (
  <div
    className={cn(
      'mt-auto w-full border-t border-slate-200 bg-white px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px+var(--host-bottom-offset,0px))]',
      className
    )}
  >
    {children}
  </div>
);

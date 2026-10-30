import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone = 'brand' | 'orange' | 'success' | 'neutral' | 'danger';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export const Badge = ({ tone = 'neutral', className, children, ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-tight',
      {
        'bg-primary-surface text-primary-dark': tone === 'brand',
        'bg-action-soft text-action-ink': tone === 'orange',
        'bg-emerald-50 text-emerald-700': tone === 'success',
        'bg-slate-100 text-slate-600': tone === 'neutral',
        'bg-red-50 text-red-600': tone === 'danger',
      },
      className
    )}
    {...props}
  >
    {children}
  </span>
);

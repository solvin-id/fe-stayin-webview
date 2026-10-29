'use client';

import { useEffect } from 'react';
import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';
import { useBookingStore } from '@/stores/useBookingStore';
import { cn } from '@/lib/utils';
import type { ToastTone } from '@/types/booking';

const ICONS: Record<ToastTone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  error: XCircle,
};

export const ToastHost = () => {
  const toast = useBookingStore((state) => state.toast);
  const hideToast = useBookingStore((state) => state.hideToast);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(hideToast, 2600);
    return () => window.clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) {
    return null;
  }

  const Icon = ICONS[toast.tone];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-[calc(env(safe-area-inset-top,0px)+64px)]">
      <div
        role="status"
        className={cn(
          'flex w-full max-w-[420px] items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-medium text-white shadow-lg animate-fade-in',
          {
            'bg-slate-800': toast.tone === 'info',
            'bg-emerald-600': toast.tone === 'success',
            'bg-action': toast.tone === 'warning',
            'bg-red-600': toast.tone === 'error',
          }
        )}
      >
        <Icon size={18} className="shrink-0" />
        <span className="leading-snug">{toast.message}</span>
      </div>
    </div>
  );
};

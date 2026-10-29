'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
  hideClose?: boolean;
  className?: string;
}

export const BottomSheet = ({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  hideClose = false,
  className,
}: BottomSheetProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 animate-fade-in"
      />
      <div
        className={cn(
          'absolute bottom-0 flex max-h-[92vh] w-full max-w-[480px] flex-col rounded-t-2xl bg-white shadow-sheet animate-slide-up',
          className
        )}
      >
        <div className="shrink-0 px-4 pt-2">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-200" />
          {title ? (
            <div className="mt-2 flex items-start gap-2 pb-2">
              <div className="min-w-0 flex-1">
                <h2 className="text-[16px] font-bold leading-tight text-slate-900">{title}</h2>
                {subtitle ? (
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{subtitle}</p>
                ) : null}
              </div>
              {hideClose ? null : (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 active:bg-slate-100"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-slate-100 bg-white px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
            {footer}
          </div>
        ) : (
          <div className="shrink-0 pb-[env(safe-area-inset-bottom,0px)]" />
        )}
      </div>
    </div>
  );
};

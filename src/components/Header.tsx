'use client';

import { ArrowLeft, Share2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onShare?: () => void;
  isAlfaTeve?: boolean;
  className?: string;
}

export const Header = ({
  title,
  subtitle,
  onBack,
  onShare,
  isAlfaTeve = false,
  className,
}: HeaderProps) => (
  <header
    className={cn(
      'relative bg-primary pt-[env(safe-area-inset-top,0px)] text-white',
      className
    )}
  >
    <div className="flex min-h-[56px] items-center gap-1 px-1.5 py-1.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali"
            className="flex h-11 w-11 items-center justify-center rounded-full active:bg-white/15"
          >
            <ArrowLeft size={22} />
          </button>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-bold leading-tight">{title}</h1>
        {subtitle ? (
          <p className="truncate text-[11px] leading-tight text-white/80">{subtitle}</p>
        ) : null}
        {isAlfaTeve ? (
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <ShieldCheck size={10} /> Terhubung via Alfa Teve
          </p>
        ) : null}
      </div>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center">
        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            aria-label="Bagikan"
            className="flex h-11 w-11 items-center justify-center rounded-full active:bg-white/15"
          >
            <Share2 size={20} />
          </button>
        ) : null}
      </div>
    </div>
  </header>
);

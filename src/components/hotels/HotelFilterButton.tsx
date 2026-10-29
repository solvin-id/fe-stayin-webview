'use client';

import { SlidersHorizontal } from 'lucide-react';

interface HotelFilterButtonProps {
  activeCity: string | null;
  onClick: () => void;
}

export const HotelFilterButton = ({ activeCity, onClick }: HotelFilterButtonProps) => (
  <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[480px] justify-end px-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
    <button
      type="button"
      onClick={onClick}
      aria-label={
        activeCity ? `Filter kota aktif: ${activeCity}. Ubah filter` : 'Buka filter kota'
      }
      className="pointer-events-auto inline-flex min-h-[48px] items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-bold text-white shadow-lg shadow-primary/30 active:bg-primary-hover"
    >
      <SlidersHorizontal size={16} />
      Filter
      {activeCity ? (
        <span className="ml-0.5 max-w-[110px] truncate rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
          {activeCity}
        </span>
      ) : null}
    </button>
  </div>
);

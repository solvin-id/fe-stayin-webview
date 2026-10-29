'use client';

import { CalendarDays, Pencil, Users } from 'lucide-react';
import { diffInNights } from '@/lib/date';
import {
  formatDateRangeCompact,
  formatNights,
  getIsoYear,
} from '@/lib/formatters';
import type { SearchQuery } from '@/types/booking';

interface SearchSummaryBarProps {
  search: SearchQuery;
  onOpen: () => void;
}

export const SearchSummaryBar = ({ search, onOpen }: SearchSummaryBarProps) => {
  const nights = diffInNights(search.checkIn, search.checkOut);

  return (
    <div className="border-t border-white/10 bg-white px-3 pb-2.5 pt-2">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Ubah tanggal dan jumlah tamu"
        className="flex min-h-[52px] w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm active:bg-slate-50"
      >
        <CalendarDays size={18} className="shrink-0 text-primary" />
        <span className="min-w-0 flex-1">
          <span className="block whitespace-nowrap text-[13px] font-bold text-slate-900">
            {formatDateRangeCompact(search.checkIn, search.checkOut)}
          </span>
          <span className="block text-[11px] text-slate-500">
            {getIsoYear(search.checkIn)} · {formatNights(nights)}
          </span>
        </span>
        <span className="h-6 w-px shrink-0 bg-slate-200" />
        <Users size={18} className="shrink-0 text-primary" />
        <span className="min-w-0">
          <span className="block whitespace-nowrap text-[13px] font-bold text-slate-900">
            {search.guests} Tamu, {search.rooms} Kamar
          </span>
          <span className="block text-[11px] text-slate-500">Ubah</span>
        </span>
        <Pencil size={14} className="shrink-0 text-slate-400" />
      </button>
    </div>
  );
};

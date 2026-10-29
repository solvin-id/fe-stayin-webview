'use client';

import { Search, X } from 'lucide-react';

interface HotelSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const HotelSearchBar = ({ value, onChange }: HotelSearchBarProps) => (
  <div className="border-t border-white/10 bg-white px-3 pb-2 pt-2">
    <div className="relative flex items-center">
      <Search size={18} className="pointer-events-none absolute left-3 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Cari nama hotel, kota, atau alamat"
        aria-label="Cari hotel"
        enterKeyHint="search"
        className="min-h-[52px] w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-[13px] font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Hapus kata kunci"
          className="absolute right-0.5 flex h-11 w-11 items-center justify-center rounded-full text-slate-400 active:bg-slate-100"
        >
          <X size={17} />
        </button>
      ) : null}
    </div>
  </div>
);

'use client';

import { Minus, Plus } from 'lucide-react';

interface CounterRowProps {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

const CounterRow = ({ label, hint, value, min, max, onChange }: CounterRowProps) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-[11px] text-slate-500">{hint}</p>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`Kurangi ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 active:bg-slate-100 disabled:opacity-40"
      >
        <Minus size={16} />
      </button>
      <span className="w-6 text-center text-sm font-bold text-slate-900">{value}</span>
      <button
        type="button"
        aria-label={`Tambah ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 active:bg-slate-100 disabled:opacity-40"
      >
        <Plus size={16} />
      </button>
    </div>
  </div>
);

interface GuestCounterProps {
  guests: number;
  rooms: number;
  onGuestsChange: (value: number) => void;
  onRoomsChange: (value: number) => void;
}

export const GuestCounter = ({
  guests,
  rooms,
  onGuestsChange,
  onRoomsChange,
}: GuestCounterProps) => (
  <div className="divide-y divide-slate-100">
    <CounterRow
      label="Tamu"
      hint="Maksimal 6 tamu per pemesanan"
      value={guests}
      min={1}
      max={6}
      onChange={onGuestsChange}
    />
    <CounterRow
      label="Kamar"
      hint="Maksimal 3 kamar per pemesanan"
      value={rooms}
      min={1}
      max={3}
      onChange={onRoomsChange}
    />
  </div>
);

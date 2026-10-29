'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { CalendarGrid } from '@/components/search/CalendarGrid';
import { SelectedDateSummary } from '@/components/search/SelectedDateSummary';
import { GuestCounter } from '@/components/search/GuestCounter';
import { getLowestNightlyRate } from '@/data/hotels';
import { addMonths, diffInNights, monthKey, monthLabel, resolveCalendarMonth, toIsoDate } from '@/lib/date';
import { formatNights } from '@/lib/formatters';
import type { SearchQuery } from '@/types/booking';

interface DateGuestPickerModalProps {
  open: boolean;
  search: SearchQuery;
  onClose: () => void;
  onApply: (search: SearchQuery) => void;
}

export const DateGuestPickerModal = ({
  open,
  search,
  onClose,
  onApply,
}: DateGuestPickerModalProps) => {
  const [minIso] = useState(() => toIsoDate(new Date()));
  const [checkIn, setCheckIn] = useState(search.checkIn);
  const [checkOut, setCheckOut] = useState(search.checkOut);
  const [guests, setGuests] = useState(search.guests);
  const [rooms, setRooms] = useState(search.rooms);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    resolveCalendarMonth(search.checkIn, minIso)
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setCheckIn(search.checkIn);
    setCheckOut(search.checkOut);
    setGuests(search.guests);
    setRooms(search.rooms);
    setVisibleMonth(resolveCalendarMonth(search.checkIn, minIso));
  }, [open, search, minIso]);

  const nights = useMemo(
    () => (checkIn && checkOut ? diffInNights(checkIn, checkOut) : 0),
    [checkIn, checkOut]
  );

  const nightlyRate = getLowestNightlyRate();
  const canGoPrev =
    monthKey(visibleMonth.year, visibleMonth.month) > minIso.slice(0, 7);

  const handleSelect = (iso: string) => {
    if (!checkIn || iso <= checkIn) {
      setCheckIn(iso);
      setCheckOut('');
      return;
    }
    setCheckOut(iso);
  };

  const handleApply = () => {
    if (!checkOut) {
      return;
    }
    onApply({ checkIn, checkOut, guests, rooms });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Pilih Tanggal & Tamu"
      subtitle="Harga terbaik ditampilkan di setiap tanggal"
      footer={
        <Button
          variant="action"
          size="lg"
          fullWidth
          disabled={!checkOut}
          onClick={handleApply}
        >
          Terapkan{checkOut ? ` · ${formatNights(nights)}` : ''}
        </Button>
      }
    >
      <SelectedDateSummary checkIn={checkIn} checkOut={checkOut} />

      <div className="mb-1 flex items-center justify-between">
        <button
          type="button"
          aria-label="Bulan sebelumnya"
          disabled={!canGoPrev}
          onClick={() =>
            setVisibleMonth(addMonths(visibleMonth.year, visibleMonth.month, -1))
          }
          className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 active:bg-slate-100 disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>
        <p className="text-sm font-bold text-slate-900">
          {monthLabel(visibleMonth.year, visibleMonth.month)}
        </p>
        <button
          type="button"
          aria-label="Bulan berikutnya"
          onClick={() => setVisibleMonth(addMonths(visibleMonth.year, visibleMonth.month, 1))}
          className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 active:bg-slate-100"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <CalendarGrid
        year={visibleMonth.year}
        month={visibleMonth.month}
        checkIn={checkIn}
        checkOut={checkOut}
        minIso={minIso}
        nightlyRate={nightlyRate}
        onSelect={handleSelect}
      />

      <div className="mt-2 border-t border-slate-100">
        <GuestCounter
          guests={guests}
          rooms={rooms}
          onGuestsChange={setGuests}
          onRoomsChange={setRooms}
        />
      </div>

      <p className="pb-4 text-[11px] text-slate-500">
        {nights > 0 ? formatNights(nights) : 'Pilih tanggal check-out'} · {rooms} kamar untuk{' '}
        {guests} tamu
      </p>
    </BottomSheet>
  );
};

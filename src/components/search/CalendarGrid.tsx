'use client';

import { cn } from '@/lib/utils';
import { buildMonthCells } from '@/lib/date';
import { formatShortPrice } from '@/lib/formatters';

const WEEKDAYS = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

interface CalendarGridProps {
  year: number;
  month: number;
  checkIn: string;
  checkOut: string;
  minIso: string;
  nightlyRate: number;
  onSelect: (iso: string) => void;
}

export const CalendarGrid = ({
  year,
  month,
  checkIn,
  checkOut,
  minIso,
  nightlyRate,
  onSelect,
}: CalendarGridProps) => {
  const cells = buildMonthCells(year, month);

  return (
    <div>
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((day, index) => (
          <span
            key={`${day}-${index}`}
            className="py-1 text-center text-[11px] font-semibold text-slate-400"
          >
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((iso, index) => {
          if (!iso) {
            return <span key={`empty-${index}`} />;
          }

          const disabled = iso < minIso;
          const isStart = iso === checkIn;
          const isEnd = iso === checkOut;
          const inRange = Boolean(checkIn && checkOut && iso > checkIn && iso < checkOut);
          const isToday = iso === minIso;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(iso)}
              aria-label={iso}
              aria-pressed={isStart || isEnd}
              className={cn(
                'flex min-h-[46px] flex-col items-center justify-center gap-0.5 border border-transparent text-[13px] font-semibold transition-colors',
                disabled && 'cursor-not-allowed text-slate-300',
                !disabled && !isStart && !isEnd && !inRange && 'text-slate-800 active:bg-slate-100',
                inRange && 'bg-primary-surface text-primary-dark',
                (isStart || isEnd) && 'rounded-lg bg-primary text-white shadow-sm',
                isToday && !isStart && !isEnd && 'border-primary/40'
              )}
            >
              <span>{Number(iso.slice(8, 10))}</span>
              {disabled ? null : (
                <span
                  className={cn(
                    'text-[9px] font-medium leading-none',
                    isStart || isEnd ? 'text-white/85' : 'text-slate-400'
                  )}
                >
                  {formatShortPrice(nightlyRate)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

'use client';

import { useEffect, useState } from 'react';
import { Building2, Check } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { CityOption } from '@/types/booking';

interface CityFilterSheetProps {
  open: boolean;
  cities: CityOption[];
  selected: string | null;
  onClose: () => void;
  onApply: (city: string | null) => void;
}

export const CityFilterSheet = ({
  open,
  cities,
  selected,
  onClose,
  onApply,
}: CityFilterSheetProps) => {
  const [draft, setDraft] = useState<string | null>(selected);

  useEffect(() => {
    if (open) {
      setDraft(selected);
    }
  }, [open, selected]);

  const options: Array<{ city: string | null; label: string; count: number }> = [
    {
      city: null,
      label: 'Semua Kota',
      count: cities.reduce((total, option) => total + option.count, 0),
    },
    ...cities.map((option) => ({
      city: option.city,
      label: option.city,
      count: option.count,
    })),
  ];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Filter Kota"
      subtitle="Pilih kota tujuan menginap"
      footer={
        <Button variant="action" size="lg" fullWidth onClick={() => onApply(draft)}>
          Terapkan Filter
        </Button>
      }
    >
      <div className="space-y-2 pb-4 pt-1">
        {options.map((option) => {
          const active = draft === option.city;
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={active}
              onClick={() => setDraft(option.city)}
              className={cn(
                'flex min-h-[52px] w-full items-center gap-2.5 rounded-xl border px-3 text-left transition-colors',
                active
                  ? 'border-primary bg-primary-surface'
                  : 'border-slate-200 bg-white active:bg-slate-50'
              )}
            >
              <Building2
                size={17}
                className={active ? 'text-primary' : 'text-slate-400'}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block truncate text-[13px] font-semibold',
                    active ? 'text-primary-dark' : 'text-slate-900'
                  )}
                >
                  {option.label}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {option.count} hotel tersedia
                </span>
              </span>
              {active ? <Check size={17} className="shrink-0 text-primary" /> : null}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};

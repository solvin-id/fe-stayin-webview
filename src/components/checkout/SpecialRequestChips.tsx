'use client';

import { BedDouble, Check, CigaretteOff, Link2, MoveUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SPECIAL_REQUESTS } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { SpecialRequestId } from '@/types/booking';

const ICONS: Record<SpecialRequestId, LucideIcon> = {
  NON_SMOKING: CigaretteOff,
  HIGH_FLOOR: MoveUp,
  CONNECTING_ROOM: Link2,
  LARGE_BED: BedDouble,
};

interface SpecialRequestChipsProps {
  selected: SpecialRequestId[];
  onToggle: (id: SpecialRequestId) => void;
}

export const SpecialRequestChips = ({ selected, onToggle }: SpecialRequestChipsProps) => (
  <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
    <h2 className="text-[14px] font-bold text-slate-900">Permintaan Khusus</h2>
    <p className="mt-0.5 text-[11px] text-slate-500">Tergantung ketersediaan saat check-in</p>
    <div className="mt-2.5 flex flex-wrap gap-2">
      {SPECIAL_REQUESTS.map((request) => {
        const active = selected.includes(request.id);
        const Icon = ICONS[request.id];
        return (
          <button
            key={request.id}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(request.id)}
            className={cn(
              'inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 text-[12px] font-semibold transition-colors',
              active
                ? 'border-primary bg-primary-surface text-primary-dark'
                : 'border-slate-200 bg-white text-slate-600 active:bg-slate-50'
            )}
          >
            <Icon size={14} /> {request.label}
            {active ? <Check size={13} /> : null}
          </button>
        );
      })}
    </div>
  </section>
);

'use client';

import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { RoomPackage } from '@/types/booking';

interface PackageSelectorProps {
  packages: RoomPackage[];
  activePackageId: string;
  onSelect: (packageId: string) => void;
}

export const PackageSelector = ({
  packages,
  activePackageId,
  onSelect,
}: PackageSelectorProps) => (
  <section className="mt-3">
    <h4 className="text-[13px] font-bold text-slate-900">Pilih Paket</h4>
    <div className="mt-1.5 space-y-1.5">
      {packages.map((roomPackage) => {
        const selected = roomPackage.id === activePackageId;
        return (
          <button
            key={roomPackage.id}
            type="button"
            onClick={() => onSelect(roomPackage.id)}
            aria-pressed={selected}
            className={cn(
              'flex min-h-[56px] w-full items-center justify-between gap-2 rounded-xl border p-2.5 text-left',
              selected
                ? 'border-primary bg-primary-surface'
                : 'border-slate-200 bg-white active:bg-slate-50'
            )}
          >
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-1">
                <span className="text-[12px] font-semibold text-slate-900">
                  {roomPackage.name}
                </span>
                {roomPackage.unitsLeft <= 3 ? (
                  <Badge tone="orange">Sisa {roomPackage.unitsLeft}</Badge>
                ) : null}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                <Check size={11} />
                {roomPackage.includesBreakfast ? 'Termasuk sarapan' : 'Tanpa sarapan'} ·{' '}
                {formatCurrency(roomPackage.pricePerNight)}/malam
              </span>
            </span>
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                selected ? 'border-primary bg-primary' : 'border-slate-300'
              )}
            >
              {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  </section>
);
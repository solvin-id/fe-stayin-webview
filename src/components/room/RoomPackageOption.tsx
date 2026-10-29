'use client';

import { Check, ShieldCheck, ShieldX, Utensils, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { RoomPackage } from '@/types/booking';

interface RoomPackageOptionProps {
  roomPackage: RoomPackage;
  highlighted?: boolean;
  onSelect: () => void;
}

export const RoomPackageOption = ({
  roomPackage,
  highlighted = false,
  onSelect,
}: RoomPackageOptionProps) => {
  const refundable = roomPackage.cancellationPolicy === 'FREE_CANCELLATION_BEFORE_48H';
  const urgent = roomPackage.unitsLeft <= 3;

  return (
    <div className={cn('py-3', highlighted && 'rounded-xl bg-primary-surface/60 px-2')}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[13px] font-semibold text-slate-900">{roomPackage.name}</span>
        {roomPackage.includesBreakfast ? (
          <Badge tone="success">
            <Utensils size={10} /> Sarapan Gratis
          </Badge>
        ) : null}
        {urgent ? (
          <Badge tone="orange" className="animate-pulse-soft">
            <Zap size={10} /> Sisa {roomPackage.unitsLeft} Kamar!
          </Badge>
        ) : null}
      </div>

      <p
        className={cn(
          'mt-1 flex items-center gap-1 text-[11px] font-medium',
          refundable ? 'text-emerald-600' : 'text-slate-500'
        )}
      >
        {refundable ? <ShieldCheck size={12} /> : <ShieldX size={12} />}
        {refundable
          ? 'Bisa refund hingga 48 jam sebelum check-in'
          : 'Tidak dapat dikembalikan'}
      </p>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          {roomPackage.originalPricePerNight ? (
            <p className="text-[11px] text-slate-400 line-through">
              {formatCurrency(roomPackage.originalPricePerNight)}
            </p>
          ) : null}
          <p className="text-[17px] font-bold leading-tight text-primary">
            {formatCurrency(roomPackage.pricePerNight)}
            <span className="ml-0.5 text-[11px] font-medium text-slate-500">/malam</span>
          </p>
        </div>
        <Button
          size="sm"
          variant="action"
          onClick={onSelect}
          className="shrink-0 gap-1 whitespace-nowrap"
        >
          <Check size={14} /> Pilih Kamar
        </Button>
      </div>
    </div>
  );
};

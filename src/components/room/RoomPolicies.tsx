import { CheckCircle2, Clock, ShieldCheck, ShieldX, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoomPackage } from '@/types/booking';

interface RoomPoliciesProps {
  checkInTime: string;
  checkOutTime: string;
  roomPackage: RoomPackage;
}

export const RoomPolicies = ({
  checkInTime,
  checkOutTime,
  roomPackage,
}: RoomPoliciesProps) => {
  const refundable = roomPackage.cancellationPolicy === 'FREE_CANCELLATION_BEFORE_48H';

  return (
    <section className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <h4 className="text-[13px] font-bold text-slate-900">Kebijakan Menginap</h4>
      <ul className="mt-2 space-y-2 text-[12px] text-slate-600">
        <li className="flex items-start gap-2">
          <Clock size={14} className="mt-0.5 shrink-0 text-primary" />
          <span>
            Check-in mulai <strong className="text-slate-900">{checkInTime}</strong>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Clock size={14} className="mt-0.5 shrink-0 text-primary" />
          <span>
            Check-out sebelum <strong className="text-slate-900">{checkOutTime}</strong>
          </span>
        </li>
        <li
          className={cn(
            'flex items-start gap-2',
            refundable ? 'text-emerald-700' : 'text-slate-600'
          )}
        >
          {refundable ? (
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
          ) : (
            <ShieldX size={14} className="mt-0.5 shrink-0" />
          )}
          <span>
            {refundable
              ? 'Refundable: gratis pembatalan hingga 48 jam sebelum check-in'
              : 'Non-refundable: pembatalan tidak dapat dikembalikan'}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>
            {roomPackage.includesBreakfast
              ? 'Termasuk sarapan untuk 2 orang'
              : 'Tanpa sarapan (Room Only)'}
          </span>
        </li>
        {roomPackage.includesBreakfast ? (
          <li className="flex items-start gap-2">
            <Utensils size={14} className="mt-0.5 shrink-0 text-emerald-600" />
            <span>Sarapan disajikan 06:00 - 10:00 di restoran hotel</span>
          </li>
        ) : null}
      </ul>
    </section>
  );
};

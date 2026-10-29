'use client';

import { CreditCard, Landmark, QrCode } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PAYMENT_METHODS } from '@/data/mockData';
import { cn } from '@/lib/utils';
import type { PaymentMethodId } from '@/types/booking';

const ICONS: Record<PaymentMethodId, LucideIcon> = {
  BCA_VA: Landmark,
  MANDIRI_VA: Landmark,
  QRIS: QrCode,
  CREDIT_CARD: CreditCard,
};

interface PaymentMethodListProps {
  selected: PaymentMethodId;
  onSelect: (method: PaymentMethodId) => void;
}

export const PaymentMethodList = ({ selected, onSelect }: PaymentMethodListProps) => (
  <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
    <h2 className="text-[14px] font-bold text-slate-900">Metode Pembayaran</h2>
    <div className="mt-2 space-y-1.5">
      {PAYMENT_METHODS.map((method) => {
        const active = method.id === selected;
        const Icon = ICONS[method.id];
        return (
          <button
            key={method.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(method.id)}
            className={cn(
              'flex min-h-[56px] w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors',
              active
                ? 'border-primary bg-primary-surface'
                : 'border-slate-200 bg-white active:bg-slate-50'
            )}
          >
            <span
              className={cn(
                'flex h-9 w-11 shrink-0 items-center justify-center rounded-md',
                active ? 'bg-white text-primary' : 'bg-slate-100 text-slate-500'
              )}
            >
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-slate-900">
                {method.name}
              </span>
              <span className="block truncate text-[11px] text-slate-500">
                {method.description}
              </span>
            </span>
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                active ? 'border-primary bg-primary' : 'border-slate-300'
              )}
            >
              {active ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  </section>
);

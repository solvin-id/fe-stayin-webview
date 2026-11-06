'use client';

import { QrCode as QrCodeIcon } from 'lucide-react';
import { QrCode } from '@/components/common/QrCode';
import { isNginepEnabled } from '@/lib/api/config';
import { formatCurrency } from '@/lib/formatters';
import type { PaymentMethodMeta } from '@/types/booking';

interface QrisPanelProps {
  method: PaymentMethodMeta;
  amount: number;
  /** QRIS payload from the gateway; null renders a skeleton. */
  qrString: string | null;
}

export const QrisPanel = ({ method, amount, qrString }: QrisPanelProps) => (
  <section className="animate-fade-in rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
    <div className="flex items-center justify-between">
      <h2 className="text-[13px] font-bold text-slate-900">{method.name}</h2>
      <span className="rounded-md bg-action-soft px-1.5 py-0.5 text-[10px] font-bold text-action-ink">
        QRIS
      </span>
    </div>

    <div className="mt-2.5 flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <QrCode value={qrString} size={176} label="QR pembayaran QRIS" />
      <p className="mt-2 text-[11px] font-semibold text-slate-700">
        Scan dengan GoPay, OVO, atau ShopeePay
      </p>
      <p className="text-[10px] text-slate-500">
        Total {formatCurrency(amount)}
      </p>
    </div>

    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
      <QrCodeIcon size={12} />
      {isNginepEnabled()
        ? 'QR dibuat oleh Midtrans; status diperbarui otomatis setelah dibayar.'
        : 'QR demo (mock) untuk simulasi, tidak terhubung payment gateway.'}
    </p>
  </section>
);

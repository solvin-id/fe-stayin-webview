'use client';

import { useState } from 'react';
import { Check, Copy, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/formatters';
import type { PaymentMethodMeta } from '@/types/booking';

interface VirtualAccountPanelProps {
  method: PaymentMethodMeta;
  amount: number;
  onCopy: (message: string) => void;
}

export const VirtualAccountPanel = ({ method, amount, onCopy }: VirtualAccountPanelProps) => {
  const [copied, setCopied] = useState(false);
  const vaNumber = method.vaNumber ?? '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(vaNumber);
      setCopied(true);
      onCopy('Nomor Virtual Account disalin.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onCopy(`Salin manual: ${vaNumber}`);
    }
  };

  return (
    <section className="animate-fade-in rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-slate-900">{method.name}</h2>
        <Badge tone="brand">{method.badge}</Badge>
      </div>

      <div className="mt-2.5 rounded-xl border border-dashed border-primary/40 bg-primary-surface/60 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Nomor Virtual Account
        </p>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="font-mono text-[17px] font-bold tracking-wide text-slate-900">
            {vaNumber}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-white px-2.5 text-[11px] font-bold text-primary shadow-sm active:bg-slate-50"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Tersalin' : 'Salin Nomor'}
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-600">
          Total tagihan{' '}
          <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
        </p>
      </div>

      <div className="mt-2.5 space-y-1.5">
        <p className="flex items-start gap-1.5 text-[11px] text-slate-600">
          <Info size={12} className="mt-0.5 shrink-0 text-primary" /> Buka mobile banking,
          pilih Transfer → Virtual Account.
        </p>
        <p className="flex items-start gap-1.5 text-[11px] text-slate-600">
          <Info size={12} className="mt-0.5 shrink-0 text-primary" /> Masukkan nomor VA di atas
          dan bayar sesuai total tagihan.
        </p>
        <p className="flex items-start gap-1.5 text-[11px] text-slate-600">
          <Info size={12} className="mt-0.5 shrink-0 text-primary" /> Voucher terbit otomatis
          setelah pembayaran diterima.
        </p>
      </div>
    </section>
  );
};

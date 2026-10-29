import { formatCurrency } from '@/lib/formatters';
import { TAX_RATE } from '@/lib/pricing';
import type { PriceSummary } from '@/types/booking';

interface PriceBreakdownProps {
  pricing: PriceSummary;
  compact?: boolean;
}

export const PriceBreakdown = ({ pricing, compact = false }: PriceBreakdownProps) => (
  <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
    <div className="flex items-center justify-between">
      <h2 className="text-[14px] font-bold text-slate-900">Rincian Biaya</h2>
      <span className="rounded-md bg-action-soft px-1.5 py-0.5 text-[10px] font-semibold text-action-ink">
        Promo Alfa Teve
      </span>
    </div>

    <dl className="mt-2.5 space-y-2 text-[12px]">
      <div className="flex items-start justify-between gap-3">
        <dt className="text-slate-600">
          Tarif Kamar ({pricing.nights} malam × {formatCurrency(pricing.pricePerNight)}
          {pricing.rooms > 1 ? ` × ${pricing.rooms} kamar` : ''})
        </dt>
        <dd className="shrink-0 font-semibold text-slate-900">
          {formatCurrency(pricing.roomTotal)}
        </dd>
      </div>
      <div className="flex items-start justify-between gap-3">
        <dt className="text-slate-600">
          Pajak & Biaya Layanan ({Math.round(TAX_RATE * 100)}%)
        </dt>
        <dd className="shrink-0 font-semibold text-slate-900">{formatCurrency(pricing.tax)}</dd>
      </div>
      <div className="flex items-start justify-between gap-3">
        <dt className="text-emerald-600">Diskon Promo Alfa Teve</dt>
        <dd className="shrink-0 font-semibold text-emerald-600">
          - {formatCurrency(pricing.discount)}
        </dd>
      </div>
    </dl>

    <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-slate-200 pt-2.5">
      <span className="text-[13px] font-bold text-slate-900">Total Pembayaran</span>
      <span className="text-[17px] font-bold text-primary">{formatCurrency(pricing.total)}</span>
    </div>

    {compact ? null : (
      <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
        Termasuk pajak dan biaya layanan. Harga akhir dalam Rupiah.
      </p>
    )}
  </section>
);

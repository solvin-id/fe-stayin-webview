import { formatCurrency } from '@/lib/formatters';
import { TAX_RATE } from '@/lib/pricing';
import type { IQuoteDto } from '@/types/api';
import type { PriceSummary } from '@/types/booking';

interface PriceBreakdownProps {
  pricing: PriceSummary;
  /** Server-computed breakdown; takes precedence over the local estimate. */
  quote?: IQuoteDto | null;
  compact?: boolean;
}

/** Charge percentages as shown to the guest, derived from the amounts themselves. */
const chargeLabel = (quote: IQuoteDto): string => {
  const subtotal = Number(quote.subtotal);
  const charges = Number(quote.serviceAmount) + Number(quote.taxAmount);
  if (!Number.isFinite(subtotal) || subtotal <= 0 || charges <= 0) {
    return 'Pajak & Biaya Layanan';
  }
  return `Pajak & Biaya Layanan (${Math.round((charges / subtotal) * 100)}%)`;
};

export const PriceBreakdown = ({ pricing, quote, compact = false }: PriceBreakdownProps) => {
  const usingQuote = quote !== null && quote !== undefined;
  const roomTotal = usingQuote ? Number(quote.subtotal) : pricing.roomTotal;
  const charges = usingQuote
    ? Number(quote.serviceAmount) + Number(quote.taxAmount)
    : pricing.tax;
  const discount = usingQuote ? Number(quote.discountAmount) : pricing.discount;
  const total = usingQuote ? Number(quote.total) : pricing.total;
  const nights = usingQuote ? quote.nights : pricing.nights;
  const pricePerNight = usingQuote ? Number(quote.pricePerNight) : pricing.pricePerNight;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-slate-900">Rincian Biaya</h2>
        <span className="rounded-md bg-action-soft px-1.5 py-0.5 text-[10px] font-semibold text-action-ink">
          {usingQuote ? 'Harga Resmi Hotel' : 'Promo Alfa Teve'}
        </span>
      </div>

      <dl className="mt-2.5 space-y-2 text-[12px]">
        <div className="flex items-start justify-between gap-3">
          <dt className="text-slate-600">
            Tarif Kamar ({nights} malam × {formatCurrency(pricePerNight)}
            {pricing.rooms > 1 ? ` × ${pricing.rooms} kamar` : ''})
          </dt>
          <dd className="shrink-0 font-semibold text-slate-900">
            {formatCurrency(roomTotal)}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-slate-600">
            {usingQuote ? chargeLabel(quote) : `Pajak & Biaya Layanan (${Math.round(TAX_RATE * 100)}%)`}
          </dt>
          <dd className="shrink-0 font-semibold text-slate-900">{formatCurrency(charges)}</dd>
        </div>
        {discount > 0 ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="text-emerald-600">
              Diskon{usingQuote && quote.promoCode ? ` (${quote.promoCode})` : ''}
            </dt>
            <dd className="shrink-0 font-semibold text-emerald-600">
              - {formatCurrency(discount)}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-slate-200 pt-2.5">
        <span className="text-[13px] font-bold text-slate-900">Total Pembayaran</span>
        <span className="text-[17px] font-bold text-primary">{formatCurrency(total)}</span>
      </div>

      {compact ? null : (
        <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
          Termasuk pajak dan biaya layanan. Harga akhir dalam Rupiah.
        </p>
      )}
    </section>
  );
};

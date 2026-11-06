import { MapPin, ShieldCheck, Star } from 'lucide-react';
import { formatDecimal, formatReviewCount } from '@/lib/formatters';
import type { Hotel } from '@/types/booking';

export const HotelInfoCard = ({
  hotel,
  hasRefundablePackage = false,
}: {
  hotel: Hotel;
  /** True only when one of the listed packages really allows a free cancellation. */
  hasRefundablePackage?: boolean;
}) => {
  // Tenant profiles may not carry rating/review/distance data; never render a
  // placeholder zero as if it were a real guest score.
  const hasRating = hotel.rating > 0;
  const hasDistance = hotel.distanceToCenter.length > 0 && hotel.distanceToCenter !== '—';
  const location = [hotel.address, hotel.city].filter(Boolean).join(', ');

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
      <div className="flex flex-wrap items-center gap-1 text-[11px] font-semibold text-amber-600">
        {hasRating ? (
          <>
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {formatDecimal(hotel.rating)} ({formatReviewCount(hotel.reviewCount)} ulasan)
          </>
        ) : (
          <span className="text-[11px] font-semibold text-slate-500">Properti resmi</span>
        )}
        {hasRefundablePackage ? (
          <span className="ml-auto rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
            <ShieldCheck size={10} className="mr-0.5 inline" /> Refundable tersedia
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 flex items-start gap-1 text-[11px] leading-relaxed text-slate-500">
        <MapPin size={12} className="mt-0.5 shrink-0" />
        {location}
        {hasDistance ? ` · ${hotel.distanceToCenter}` : ''}
      </p>
      <p className="mt-1 text-[11px] text-slate-500">
        Check-in {hotel.checkInTime} · Check-out {hotel.checkOutTime}
      </p>
    </section>
  );
};

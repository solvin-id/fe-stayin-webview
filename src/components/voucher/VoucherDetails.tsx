import { MapPin, Star } from 'lucide-react';
import { getPaymentMethod } from '@/data/mockData';
import { formatCurrency, formatDateWithDay, formatDecimal, formatReviewCount } from '@/lib/formatters';
import type { Booking } from '@/types/booking';

export const VoucherDetails = ({ booking }: { booking: Booking }) => {
  const method = getPaymentMethod(booking.method);
  const guestName = booking.guest.bookingForOther
    ? booking.guest.guestName
    : booking.guest.fullName;

  return (
    <div className="space-y-2.5">
      <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
        <div className="flex items-start gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-surface text-primary">
            <MapPin size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] font-bold text-slate-900">{booking.hotel.name}</h2>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
              {booking.hotel.address}, {booking.hotel.city}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
              <Star size={11} className="fill-amber-400 text-amber-400" />
              {formatDecimal(booking.hotel.rating)} · {formatReviewCount(booking.hotel.reviewCount)}{' '}
              ulasan
            </p>
          </div>
        </div>
        <a
          href={booking.hotel.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2.5 flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary-surface text-[12px] font-bold text-primary active:bg-primary/10"
        >
          Buka Petunjuk Arah
        </a>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
        <h3 className="text-[13px] font-bold text-slate-900">Detail Menginap</h3>
        <dl className="mt-2 space-y-2 text-[12px]">
          <div className="flex items-start justify-between gap-3">
            <dt className="text-slate-500">Check-in</dt>
            <dd className="text-right font-semibold text-slate-900">
              {formatDateWithDay(booking.search.checkIn)}
              <span className="block text-[10px] font-normal text-slate-500">
                mulai {booking.hotel.checkInTime}
              </span>
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-slate-500">Check-out</dt>
            <dd className="text-right font-semibold text-slate-900">
              {formatDateWithDay(booking.search.checkOut)}
              <span className="block text-[10px] font-normal text-slate-500">
                sebelum {booking.hotel.checkOutTime}
              </span>
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-slate-500">Kamar</dt>
            <dd className="text-right font-semibold text-slate-900">
              {booking.roomName}
              <span className="block text-[10px] font-normal text-slate-500">
                {booking.packageName}
              </span>
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-slate-500">Tamu</dt>
            <dd className="text-right font-semibold text-slate-900">
              {guestName}
              <span className="block text-[10px] font-normal text-slate-500">
                {booking.search.guests} tamu · {booking.search.rooms} kamar · {booking.nights}{' '}
                malam
              </span>
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-slate-500">Pembayaran</dt>
            <dd className="text-right font-semibold text-emerald-600">
              LUNAS
              <span className="block text-[10px] font-normal text-slate-500">{method.name}</span>
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3 border-t border-dashed border-slate-200 pt-2">
            <dt className="font-bold text-slate-900">Total</dt>
            <dd className="text-[15px] font-bold text-primary">
              {formatCurrency(booking.pricing.total)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
};

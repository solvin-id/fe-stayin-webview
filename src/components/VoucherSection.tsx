'use client';

import { CheckCircle2, Copy, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { StepProgress } from '@/components/common/StepProgress';
import { MockQrCode } from '@/components/voucher/MockQrCode';
import { VoucherDetails } from '@/components/voucher/VoucherDetails';
import { VoucherActions } from '@/components/voucher/VoucherActions';
import { useBookingStore } from '@/stores/useBookingStore';
import { useHostContext } from '@/hooks/useHostContext';

export const VoucherSection = () => {
  const booking = useBookingStore((state) => state.booking);
  const payment = useBookingStore((state) => state.payment);
  const showToast = useBookingStore((state) => state.showToast);
  const { isAlfaTeve } = useHostContext();

  if (!booking) {
    return null;
  }

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(booking.reference);
      showToast('Kode reservasi disalin.', 'success');
    } catch {
      showToast(`Kode reservasi: ${booking.reference}`, 'info');
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <div className="sticky top-0 z-30">
        <Header title="E-Voucher" subtitle={booking.hotel.name} isAlfaTeve={isAlfaTeve} />
      </div>
      <StepProgress activeIndex={3} />

      <div className="flex-1 space-y-2.5 px-3 pb-[calc(2rem+var(--host-bottom-offset,0px))] pt-1">
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5">
          <div className="flex items-start gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CheckCircle2 size={22} />
            </span>
            <div>
              <p className="text-[15px] font-bold text-emerald-800">Pemesanan Berhasil</p>
              <p className="text-[11px] font-semibold text-emerald-700">
                Confirmed ·{' '}
                {payment.status === 'PAID' ? 'Pembayaran lunas' : 'Menunggu verifikasi'}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-emerald-700">
                Tunjukkan e-voucher ini ke resepsionis saat check-in.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Kode Reservasi
              </p>
              <p className="truncate font-mono text-[17px] font-bold tracking-wide text-slate-900">
                {booking.reference}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyReference}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-lg bg-primary-surface px-2.5 text-[11px] font-bold text-primary active:bg-primary/15"
            >
              <Copy size={14} /> Salin
            </button>
          </div>

          <div className="mt-3 flex flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-3">
            <MockQrCode
              value={`STAYIN|${booking.reference}|${booking.hotel.id}|${booking.search.checkIn}|${booking.search.checkOut}`}
              size={188}
            />
            <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
              <ShieldCheck size={11} className="text-emerald-600" /> Scan QR untuk verifikasi
              check-in (demo)
            </p>
          </div>
        </section>

        <VoucherDetails booking={booking} />
        <VoucherActions booking={booking} />

        <p className="pb-2 text-center text-[10px] leading-relaxed text-slate-400">
          Voucher digital diterbitkan oleh Stayin untuk {booking.hotel.name}.
          <br />
          Butuh bantuan? Hubungi {booking.hotel.phone}
        </p>
      </div>
    </div>
  );
};

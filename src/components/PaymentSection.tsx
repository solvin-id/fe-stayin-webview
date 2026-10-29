'use client';

import { ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { StepProgress } from '@/components/common/StepProgress';
import { Button } from '@/components/ui/Button';
import { StickyActionBar } from '@/components/ui/StickyActionBar';
import { PaymentCountdownBanner } from '@/components/payment/PaymentCountdownBanner';
import { PaymentMethodList } from '@/components/payment/PaymentMethodList';
import { VirtualAccountPanel } from '@/components/payment/VirtualAccountPanel';
import { QrisPanel } from '@/components/payment/QrisPanel';
import { CreditCardPanel } from '@/components/payment/CreditCardPanel';
import { PaymentExpiredDialog } from '@/components/payment/PaymentExpiredDialog';
import { useBookingStore } from '@/stores/useBookingStore';
import { useHostContext } from '@/hooks/useHostContext';
import { useCountdown } from '@/hooks/useCountdown';
import { getPaymentMethod } from '@/data/mockData';
import { formatCurrency, formatDateShort } from '@/lib/formatters';

export const PaymentSection = () => {
  const booking = useBookingStore((state) => state.booking);
  const payment = useBookingStore((state) => state.payment);
  const setPaymentMethod = useBookingStore((state) => state.setPaymentMethod);
  const confirmPayment = useBookingStore((state) => state.confirmPayment);
  const expirePayment = useBookingStore((state) => state.expirePayment);
  const restartAfterExpiry = useBookingStore((state) => state.restartAfterExpiry);
  const showToast = useBookingStore((state) => state.showToast);
  const goToStep = useBookingStore((state) => state.goToStep);
  const { isAlfaTeve } = useHostContext();
  const { label } = useCountdown(payment.expiresAt, expirePayment);

  if (!booking) {
    return null;
  }

  const method = getPaymentMethod(payment.method);
  const amount = booking.pricing.total;
  const expired = payment.status === 'EXPIRED';

  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <div className="sticky top-0 z-30">
        <Header
          title="Pembayaran"
          subtitle={booking.hotel.name}
          isAlfaTeve={isAlfaTeve}
          onBack={() => goToStep(4)}
        />
        <PaymentCountdownBanner label={label} expired={expired} />
      </div>
      <StepProgress activeIndex={2} />


      <div className="flex-1 space-y-2.5 px-3 pb-[calc(8rem+var(--host-bottom-offset,0px))] pt-1">
        <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Kode Booking
              </p>
              <p className="font-mono text-[14px] font-bold text-slate-900">
                {booking.reference}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
              {expired ? 'Kedaluwarsa' : 'Menunggu Pembayaran'}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 text-[11px]">
            <div>
              <p className="text-slate-500">Check-in</p>
              <p className="font-semibold text-slate-900">
                {formatDateShort(booking.search.checkIn)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Check-out</p>
              <p className="font-semibold text-slate-900">
                {formatDateShort(booking.search.checkOut)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500">Kamar</p>
              <p className="font-semibold text-slate-900">
                {booking.roomName} · {booking.packageName}
              </p>
            </div>
          </div>
        </section>

        <PaymentMethodList selected={payment.method} onSelect={setPaymentMethod} />

        {payment.method === 'BCA_VA' || payment.method === 'MANDIRI_VA' ? (
          <VirtualAccountPanel
            method={method}
            amount={amount}
            onCopy={(message) => showToast(message, 'success')}
          />
        ) : null}
        {payment.method === 'QRIS' ? (
          <QrisPanel method={method} amount={amount} reference={booking.reference} />
        ) : null}
        {payment.method === 'CREDIT_CARD' ? <CreditCardPanel method={method} /> : null}

        <p className="flex items-center justify-center gap-1 pb-1 text-[10px] text-slate-400">
          <ShieldCheck size={11} /> Transaksi dilindungi enkripsi Stayin SecurePay
        </p>
      </div>

      <StickyActionBar>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-slate-500">Total Pembayaran</p>
            <p className="truncate text-[17px] font-bold text-primary">{formatCurrency(amount)}</p>
          </div>
          <Button
            variant="action"
            size="lg"
            onClick={confirmPayment}
            disabled={expired}
            className="shrink-0"
          >
            Saya Sudah Bayar
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[9px] text-slate-400">
          Tombol simulasi: pembayaran dianggap sukses.
        </p>
      </StickyActionBar>

      <PaymentExpiredDialog open={expired} onRestart={restartAfterExpiry} />
    </div>
  );
};

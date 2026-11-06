'use client';

import { useEffect } from 'react';
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
import { usePaymentInstructions } from '@/hooks/usePaymentInstructions';
import { isNginepEnabled } from '@/lib/api/config';
import { PAYMENT_METHODS, getPaymentMethod } from '@/data/mockData';
import { formatCurrency, formatDateShort } from '@/lib/formatters';
import { SERVER_STATUS_LABELS } from '@/lib/status';
import type { PaymentMethodId } from '@/types/booking';

/** Card payment needs Snap's 3DS tokenisation, which the in-app panel does not have. */
const API_PAYMENT_METHODS = PAYMENT_METHODS.filter((method) => method.id !== 'CREDIT_CARD');

export const PaymentSection = () => {
  const booking = useBookingStore((state) => state.booking);
  const payment = useBookingStore((state) => state.payment);
  const setPaymentMethod = useBookingStore((state) => state.setPaymentMethod);
  const confirmPayment = useBookingStore((state) => state.confirmPayment);
  const expirePayment = useBookingStore((state) => state.expirePayment);
  const restartAfterExpiry = useBookingStore((state) => state.restartAfterExpiry);
  const showToast = useBookingStore((state) => state.showToast);
  const goToStep = useBookingStore((state) => state.goToStep);
  const completeServerPayment = useBookingStore((state) => state.completeServerPayment);
  const { isAlfaTeve } = useHostContext();
  const { label } = useCountdown(payment.expiresAt, expirePayment);
  const apiMode = isNginepEnabled();
  const {
    instruction,
    status: instructionStatus,
    error: instructionError,
    charge,
    retry: retryInstruction,
  } = usePaymentInstructions(
    booking?.bookingIds?.[0] ?? null,
    booking?.reference ?? null
  );

  // The gateway's settlement reaches the server first; the instrument poll is how
  // this screen learns about it, so the guest lands on the voucher without a tap.
  useEffect(() => {
    if (instruction?.status === 'paid') {
      completeServerPayment();
    }
  }, [instruction?.status, completeServerPayment]);

  if (!booking) {
    return null;
  }

  const mockMethod = getPaymentMethod(payment.method);
  const instructionMethod = instruction
    ? getPaymentMethod(instruction.method as PaymentMethodId)
    : null;
  const amount = booking.pricing.total;
  const expired = payment.status === 'EXPIRED';
  const serverStatus = apiMode ? (booking.serverStatus ?? null) : null;
  const statusBadge = expired
    ? 'Kedaluwarsa'
    : instruction?.status === 'paid'
      ? 'Pembayaran Diterima'
      : (serverStatus
          ? SERVER_STATUS_LABELS[serverStatus] ?? serverStatus
          : 'Menunggu Pembayaran');
  const buildingInstruction = instructionStatus === 'loading' && instruction === null;

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

      <div className="flex-1 space-y-2.5 px-3 pb-4 pt-1">
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
            <span
              className={
                serverStatus === 'CONFIRMED' || instruction?.status === 'paid'
                  ? 'shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700'
                  : 'shrink-0 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700'
              }
            >
              {statusBadge}
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

        <PaymentMethodList
          methods={apiMode ? API_PAYMENT_METHODS : PAYMENT_METHODS}
          selected={payment.method}
          onSelect={setPaymentMethod}
          disabled={apiMode && instruction !== null}
        />

        {apiMode && instructionError ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-3.5">
            <p className="text-[12px] font-semibold text-red-700">{instructionError}</p>
            <button
              type="button"
              onClick={retryInstruction}
              className="mt-2 min-h-[44px] rounded-xl bg-white px-4 text-[12px] font-bold text-red-700 shadow-sm"
            >
              Coba Lagi
            </button>
          </section>
        ) : null}

        {apiMode && instruction && instructionMethod ? (
          instruction.method === 'QRIS' ? (
            <QrisPanel
              method={instructionMethod}
              amount={amount}
              qrString={instruction.qrString}
            />
          ) : instruction.method === 'CREDIT_CARD' ? (
            <CreditCardPanel method={instructionMethod} />
          ) : (
            <VirtualAccountPanel
              method={instructionMethod}
              amount={amount}
              vaNumber={instruction.vaNumber}
              billerCode={instruction.billerCode}
              billKey={instruction.billKey}
              onCopy={(message) => showToast(message, 'success')}
            />
          )
        ) : null}

        {apiMode && instruction && instruction.status !== 'pending' ? (
          <p className="rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-700">
            {instruction.status === 'paid'
              ? 'Pembayaran diterima. Menunggu konfirmasi hotel.'
              : 'Pembayaran gagal atau kedaluwarsa. Buat ulang sesuai batas waktu.'}
          </p>
        ) : null}

        {!apiMode && (payment.method === 'BCA_VA' || payment.method === 'MANDIRI_VA') ? (
          <VirtualAccountPanel
            method={mockMethod}
            amount={amount}
            vaNumber={mockMethod.vaNumber ?? null}
            onCopy={(message) => showToast(message, 'success')}
          />
        ) : null}
        {!apiMode && payment.method === 'QRIS' ? (
          <QrisPanel
            method={mockMethod}
            amount={amount}
            qrString={mockMethod.qrPayload ?? null}
          />
        ) : null}
        {!apiMode && payment.method === 'CREDIT_CARD' ? (
          <CreditCardPanel method={mockMethod} />
        ) : null}

        <p className="flex items-center justify-center gap-1 pb-1 text-[10px] text-slate-400">
          <ShieldCheck size={11} />
          {apiMode
            ? 'Pembayaran diproses oleh Midtrans.'
            : 'Transaksi dilindungi enkripsi Stayin SecurePay'}
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
            onClick={apiMode && !instruction ? () => charge(payment.method) : confirmPayment}
            isLoading={buildingInstruction}
            disabled={expired || (apiMode && !instruction && !booking.bookingIds?.length)}
            className="shrink-0"
          >
            {apiMode
              ? instruction
                ? 'Cek Status Pembayaran'
                : buildingInstruction
                  ? 'Membuat nomor pembayaran…'
                  : 'Lanjutkan Pembayaran'
              : 'Saya Sudah Bayar'}
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[9px] text-slate-400">
          {apiMode
            ? 'Status diperiksa otomatis setiap 5 detik selama halaman ini terbuka.'
            : 'Tombol simulasi: pembayaran dianggap sukses.'}
        </p>
      </StickyActionBar>

      <PaymentExpiredDialog open={expired} onRestart={restartAfterExpiry} />
    </div>
  );
};

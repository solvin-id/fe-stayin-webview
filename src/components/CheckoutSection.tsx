'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronRight, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { StepProgress } from '@/components/common/StepProgress';
import { GuestForm } from '@/components/checkout/GuestForm';
import { SpecialRequestChips } from '@/components/checkout/SpecialRequestChips';
import { PriceBreakdown } from '@/components/checkout/PriceBreakdown';
import { Button } from '@/components/ui/Button';
import { StickyActionBar } from '@/components/ui/StickyActionBar';
import { useBookingStore } from '@/stores/useBookingStore';
import { useHostContext } from '@/hooks/useHostContext';
import { getPackageById, getRoomById } from '@/data/hotels';
import { diffInNights } from '@/lib/date';
import { formatCurrency, formatDateWithDay } from '@/lib/formatters';
import { buildPriceSummary } from '@/lib/pricing';
import { validateGuest, type GuestFormErrors } from '@/lib/validation';
import type { GuestDetails } from '@/types/booking';

export const CheckoutSection = () => {
  const step = useBookingStore((state) => state.step);
  const search = useBookingStore((state) => state.search);
  const guest = useBookingStore((state) => state.guest);
  const selectedRoomId = useBookingStore((state) => state.selectedRoomId);
  const selectedPackageId = useBookingStore((state) => state.selectedPackageId);
  const updateGuest = useBookingStore((state) => state.updateGuest);
  const toggleSpecialRequest = useBookingStore((state) => state.toggleSpecialRequest);
  const startPayment = useBookingStore((state) => state.startPayment);
  const goToStep = useBookingStore((state) => state.goToStep);
  const showToast = useBookingStore((state) => state.showToast);
  const { isAlfaTeve } = useHostContext();
  const [errors, setErrors] = useState<GuestFormErrors>({});

  const room = getRoomById(selectedRoomId);
  const roomPackage = getPackageById(room, selectedPackageId);
  const nights = diffInNights(search.checkIn, search.checkOut);
  const pricing = useMemo(
    () => (roomPackage ? buildPriceSummary(roomPackage.pricePerNight, nights, search.rooms) : null),
    [roomPackage, nights, search.rooms]
  );

  if (!room || !roomPackage || !pricing) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm font-semibold text-slate-700">Kamar belum dipilih.</p>
        <Button onClick={() => goToStep(2)}>Kembali ke Daftar Kamar</Button>
      </div>
    );
  }

  const handleChange = (patch: Partial<GuestDetails>) => {
    updateGuest(patch);
    setErrors({});
  };

  const handleSubmit = () => {
    const nextErrors = validateGuest(guest);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      showToast('Lengkapi data pemesan terlebih dahulu.', 'error');
      return;
    }
    setErrors({});
    startPayment();
  };

  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <div className="sticky top-0 z-30">
        <Header
          title="Rincian Pemesanan"
          subtitle={room.name}
          isAlfaTeve={isAlfaTeve}
          onBack={() => goToStep(2)}
        />
      </div>
      <StepProgress activeIndex={step - 3} />

      <div className="flex-1 space-y-2.5 px-3 pb-[calc(8rem+var(--host-bottom-offset,0px))] pt-1">
        <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
          <div className="flex items-start gap-2">
            <div className="rounded-lg bg-primary-surface p-2 text-primary">
              <CalendarDays size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold leading-snug text-slate-900">
                {formatDateWithDay(search.checkIn)} - {formatDateWithDay(search.checkOut)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {nights} malam · {search.guests} tamu · {search.rooms} kamar
              </p>
              <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                <ShieldCheck size={10} /> Kamar dikunci 15 menit setelah lanjut bayar
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-slate-900">
                {roomPackage.name}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {room.name} · {room.bedType}
              </p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-300" />
          </div>
        </section>

        <GuestForm guest={guest} errors={errors} onChange={handleChange} />
        <SpecialRequestChips
          selected={guest.specialRequests}
          onToggle={toggleSpecialRequest}
        />
        <PriceBreakdown pricing={pricing} />
      </div>

      <StickyActionBar>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-slate-500">Total Pembayaran</p>
            <p className="truncate text-[17px] font-bold text-primary">
              {formatCurrency(pricing.total)}
            </p>
          </div>
          <Button variant="action" size="lg" onClick={handleSubmit} className="shrink-0">
            Lanjut Bayar
          </Button>
        </div>
      </StickyActionBar>
    </div>
  );
};

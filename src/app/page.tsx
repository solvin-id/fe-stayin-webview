'use client';

import { useCallback } from 'react';
import type { CSSProperties } from 'react';
import { CheckoutSection } from '@/components/CheckoutSection';
import { PaymentSection } from '@/components/PaymentSection';
import { HotelGroupDetail } from '@/components/hotels/HotelGroupDetail';
import { HotelsScreen } from '@/components/hotels/HotelsScreen';
import { RoomsScreen } from '@/components/rooms/RoomsScreen';
import { VoucherSection } from '@/components/VoucherSection';
import { ToastHost } from '@/components/ui/ToastHost';
import { getHotelGroupById } from '@/data/hotelGroups';
import { useHostBottomOffset } from '@/hooks/useHostBottomOffset';
import { useHostContext } from '@/hooks/useHostContext';
import { useWebviewBack } from '@/hooks/useWebviewBack';
import { closeWebview } from '@/services/bridge.service';
import { useBookingStore } from '@/stores/useBookingStore';

export default function Page() {
  const step = useBookingStore((state) => state.step);
  const selectedHotelId = useBookingStore((state) => state.selectedHotelId);
  const selectedRoomId = useBookingStore((state) => state.selectedRoomId);
  const activeGroupId = useBookingStore((state) => state.activeGroupId);
  const goToStep = useBookingStore((state) => state.goToStep);
  const closeRoomDetail = useBookingStore((state) => state.closeRoomDetail);
  const closeGroup = useBookingStore((state) => state.closeGroup);
  const selectHotel = useBookingStore((state) => state.selectHotel);
  const showToast = useBookingStore((state) => state.showToast);
  const { isEmbedded } = useHostContext();
  const bottomOffset = useHostBottomOffset();

  const activeGroup = getHotelGroupById(activeGroupId) ?? null;

  const handleBack = useCallback(() => {
    if (activeGroupId) {
      closeGroup();
      return;
    }
    if (step === 2) {
      goToStep(1);
      return;
    }
    if (step === 3) {
      closeRoomDetail();
      return;
    }
    if (step === 4) {
      goToStep(3);
      return;
    }
    if (step === 5) {
      goToStep(4);
    }
  }, [activeGroupId, closeGroup, step, closeRoomDetail, goToStep]);

  const handleExit = useCallback(() => {
    const target = closeWebview();
    if (target === 'browser') {
      showToast('Pratinjau browser: event close_webview dikirim ke parent.', 'info');
    }
  }, [showToast]);

  useWebviewBack({
    enabled: isEmbedded,
    atRoot: !activeGroupId && (step === 1 || step === 6),
    onBack: handleBack,
    onExit: handleExit,
  });

  return (
    <div
      className="flex flex-1 flex-col"
      style={{ '--host-bottom-offset': `${bottomOffset}px` } as CSSProperties}
    >
      {activeGroup ? (
        <HotelGroupDetail
          group={activeGroup}
          onBack={closeGroup}
          onSelectHotel={selectHotel}
        />
      ) : null}

      {!activeGroup && step === 1 ? <HotelsScreen /> : null}
      {!activeGroup && (step === 2 || step === 3) && selectedHotelId ? <RoomsScreen /> : null}
      {!activeGroup && step === 4 && selectedRoomId ? <CheckoutSection /> : null}
      {!activeGroup && step === 5 && selectedRoomId ? <PaymentSection /> : null}
      {!activeGroup && step === 6 ? <VoucherSection /> : null}
      <ToastHost />
    </div>
  );
}
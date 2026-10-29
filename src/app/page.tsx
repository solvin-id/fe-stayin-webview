'use client';

import { useCallback } from 'react';
import type { CSSProperties } from 'react';
import { CheckoutSection } from '@/components/CheckoutSection';
import { PaymentSection } from '@/components/PaymentSection';
import { HotelsScreen } from '@/components/hotels/HotelsScreen';
import { RoomsScreen } from '@/components/rooms/RoomsScreen';
import { VoucherSection } from '@/components/VoucherSection';
import { ToastHost } from '@/components/ui/ToastHost';
import { useHostBottomOffset } from '@/hooks/useHostBottomOffset';
import { useHostContext } from '@/hooks/useHostContext';
import { useWebviewBack } from '@/hooks/useWebviewBack';
import { closeWebview } from '@/services/bridge.service';
import { useBookingStore } from '@/stores/useBookingStore';

export default function Page() {
  const step = useBookingStore((state) => state.step);
  const selectedHotelId = useBookingStore((state) => state.selectedHotelId);
  const selectedRoomId = useBookingStore((state) => state.selectedRoomId);
  const goToStep = useBookingStore((state) => state.goToStep);
  const closeRoomDetail = useBookingStore((state) => state.closeRoomDetail);
  const showToast = useBookingStore((state) => state.showToast);
  const { isEmbedded } = useHostContext();
  const bottomOffset = useHostBottomOffset();

  const handleBack = useCallback(() => {
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
  }, [step, closeRoomDetail, goToStep]);

  const handleExit = useCallback(() => {
    const target = closeWebview();
    if (target === 'browser') {
      showToast('Pratinjau browser: event close_webview dikirim ke parent.', 'info');
    }
  }, [showToast]);

  useWebviewBack({
    enabled: isEmbedded,
    atRoot: step === 1 || step === 6,
    onBack: handleBack,
    onExit: handleExit,
  });

  return (
    <div
      className="flex flex-1 flex-col"
      style={{ '--host-bottom-offset': `${bottomOffset}px` } as CSSProperties}
    >
      {step === 1 ? <HotelsScreen /> : null}
      {(step === 2 || step === 3) && selectedHotelId ? <RoomsScreen /> : null}
      {step === 4 && selectedRoomId ? <CheckoutSection /> : null}
      {step === 5 && selectedRoomId ? <PaymentSection /> : null}
      {step === 6 ? <VoucherSection /> : null}
      <ToastHost />
    </div>
  );
}

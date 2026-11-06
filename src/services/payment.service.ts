import { nginepFetch } from '@/lib/api/client';
import { isNginepEnabled } from '@/lib/api/config';
import type { IBookingsStatusDto, IPaymentInstructionDto } from '@/types/api';
import type { PaymentMethodId } from '@/types/booking';

/**
 * Starts the payment for a held booking: the API charges Midtrans and returns the
 * VA number / QR payload the guest must use. Returns null in mock mode.
 */
export const chargePayment = async (
  bookingId: string,
  method: PaymentMethodId,
  tenant?: string,
): Promise<IPaymentInstructionDto | null> => {
  if (!isNginepEnabled()) {
    return null;
  }
  return nginepFetch<IPaymentInstructionDto>('/payment/charge', {
    method: 'POST',
    body: { bookingId, method },
    tenant,
  });
};

/** The instrument already charged for this booking, or null when there is none. */
export const getPaymentInstructions = async (
  code: string,
  tenant?: string,
): Promise<IPaymentInstructionDto | null> => {
  if (!isNginepEnabled()) {
    return null;
  }
  return nginepFetch<IPaymentInstructionDto>(
    `/storefront/bookings/${encodeURIComponent(code)}/payment`,
    { tenant },
  );
};

/**
 * Looks up a booking's safe status subset by its public code. Guests have no
 * account, so this is the polling endpoint — never confirm on their behalf.
 */
export const getBookingStatus = async (
  code: string,
  tenant?: string,
): Promise<IBookingsStatusDto | null> => {
  if (!isNginepEnabled()) {
    return null;
  }
  return nginepFetch<IBookingsStatusDto>(`/storefront/bookings/${code}`, {
    tenant,
  });
};

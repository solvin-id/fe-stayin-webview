import { nginepFetch } from '@/lib/api/client';
import { isNginepEnabled } from '@/lib/api/config';
import type { IBookingsStatusDto } from '@/types/api';

export interface ISnapTokenResponse {
  snapToken: string;
}

/** Requests a Midtrans Snap token for a held booking. */
export const getSnapToken = async (
  bookingId: string,
  tenant?: string,
): Promise<ISnapTokenResponse | null> => {
  if (!isNginepEnabled()) {
    return null;
  }
  return nginepFetch<ISnapTokenResponse>('/payment/snap', {
    method: 'POST',
    body: { bookingId },
    tenant,
  });
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

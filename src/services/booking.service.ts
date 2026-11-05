import { nginepFetch } from '@/lib/api/client';
import { isNginepEnabled } from '@/lib/api/config';
import type { IBookingResponse } from '@/types/api';

export interface ICreateBookingInput {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
}

export const randomKey = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `key-${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * Creates a booking with an idempotency key so a retried submit never books
 * twice. Returns null when Nginep integration is disabled (mock mode).
 */
export const createBooking = async (
  input: ICreateBookingInput,
  tenant?: string,
  /** Pass a stable key per submission intent so retries replay instead of re-booking. */
  idempotencyKey?: string,
): Promise<IBookingResponse | null> => {
  if (!isNginepEnabled()) {
    return null;
  }
  return nginepFetch<IBookingResponse>('/booking', {
    method: 'POST',
    body: input,
    idempotencyKey: idempotencyKey ?? randomKey(),
    tenant,
  });
};

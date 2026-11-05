import { nginepFetch } from '@/lib/api/client';
import { isNginepEnabled } from '@/lib/api/config';
import type { IAvailabilityOfferDto } from '@/types/api';

export interface IAvailabilityQuery {
  checkIn: string;
  checkOut: string;
  guests: number;
}

/**
 * Searches live availability. Returns null when Nginep integration is
 * disabled so callers can fall back to mock data.
 */
export const searchAvailability = async (
  query: IAvailabilityQuery,
  tenant?: string,
): Promise<IAvailabilityOfferDto[] | null> => {
  if (!isNginepEnabled()) {
    return null;
  }
  return nginepFetch<IAvailabilityOfferDto[]>('/availability', {
    method: 'POST',
    body: {
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      guests: query.guests,
    },
    tenant,
  });
};

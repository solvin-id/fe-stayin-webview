import { nginepFetch } from '@/lib/api/client';
import { isNginepEnabled } from '@/lib/api/config';
import type { IQuoteDto } from '@/types/api';

export interface IQuoteQuery {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  promoCode?: string;
}

/**
 * Server-side checkout breakdown. The API applies the property's tax/service
 * policy and any voucher, so the numbers shown here are the numbers the booking
 * transaction will charge. Returns null in mock mode.
 */
export const getQuote = async (
  query: IQuoteQuery,
  tenant?: string,
): Promise<IQuoteDto | null> => {
  if (!isNginepEnabled()) {
    return null;
  }
  return nginepFetch<IQuoteDto>('/storefront/quote', {
    method: 'POST',
    body: {
      roomId: query.roomId,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      guests: query.guests,
      ...(query.promoCode ? { promoCode: query.promoCode } : {}),
    },
    tenant,
  });
};

import { nginepFetch } from '@/lib/api/client';
import { isNginepEnabled } from '@/lib/api/config';
import type { IHotelProfileDto } from '@/types/api';

/**
 * Tenant hotel profile + rooms via the BFF. Returns null when the Nginep
 * integration is disabled so callers can fall back to mock data.
 */
export const getHotelProfile = async (
  tenant?: string,
): Promise<IHotelProfileDto | null> => {
  if (!isNginepEnabled()) {
    return null;
  }
  return nginepFetch<IHotelProfileDto>('/storefront/hotel-profile', {
    tenant,
  });
};

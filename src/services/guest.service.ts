import { nginepFetch } from '@/lib/api/client';
import { isNginepEnabled } from '@/lib/api/config';
import type { IGuestProfileDto } from '@/types/api';

/**
 * Guest identity from the host's signed token (`?token=` at launch). Null when the
 * integration is off, the token is missing, or the API has no guest secret —
 * every one of those means "show the empty form", never an error banner.
 */
export const getGuestProfile = async (
  tenant?: string,
): Promise<IGuestProfileDto | null> => {
  if (!isNginepEnabled()) {
    return null;
  }
  try {
    const profile = await nginepFetch<IGuestProfileDto>(
      '/storefront/guest-session',
      { method: 'POST', body: {}, tenant },
    );
    return profile;
  } catch {
    return null;
  }
};

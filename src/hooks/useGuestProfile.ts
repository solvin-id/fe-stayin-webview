'use client';

import { useEffect, useState } from 'react';
import { isNginepEnabled } from '@/lib/api/config';
import { getGuestProfile } from '@/services/guest.service';
import { useBookingStore } from '@/stores/useBookingStore';
import type { IGuestProfileDto } from '@/types/api';
import type { GuestDetails } from '@/types/booking';

export type GuestProfileStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UseGuestProfileResult {
  profile: IGuestProfileDto | null;
  status: GuestProfileStatus;
}

/**
 * Fills the checkout form from the host's signed token. Only fields the guest has
 * not typed into are touched, so a profile that arrives late never overwrites an
 * edit; a missing/invalid token leaves the form exactly as it was.
 */
export const useGuestProfile = (): UseGuestProfileResult => {
  const updateGuest = useBookingStore((state) => state.updateGuest);
  const [profile, setProfile] = useState<IGuestProfileDto | null>(null);
  const [status, setStatus] = useState<GuestProfileStatus>('idle');

  useEffect(() => {
    if (!isNginepEnabled()) {
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('loading');

    void getGuestProfile().then((result) => {
      if (cancelled) {
        return;
      }
      if (!result) {
        setStatus('error');
        return;
      }
      setProfile(result);
      setStatus('ready');
      const guest = useBookingStore.getState().guest;
      const patch: Partial<GuestDetails> = {};
      if (guest.fullName.trim().length === 0 && result.name) {
        patch.fullName = result.name;
      }
      if (guest.email.trim().length === 0 && result.email) {
        patch.email = result.email;
      }
      if (guest.phone.trim().length === 0 && result.phone) {
        patch.phone = result.phone;
      }
      if (Object.keys(patch).length > 0) {
        updateGuest(patch);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [updateGuest]);

  return { profile, status };
};

'use client';

import { useCallback, useEffect, useState } from 'react';
import { isNginepEnabled } from '@/lib/api/config';
import { searchAvailability } from '@/services/availability.service';
import type { IAvailabilityOfferDto } from '@/types/api';
import { diffInNights } from '@/lib/date';
import { parseFacilities, useCatalogStore } from '@/stores/useCatalogStore';
import type { Room, RoomPackage, SearchQuery } from '@/types/booking';

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Maps flat availability offers to the webview Room shape, one package per offer. */
export const mapOffersToRooms = (offers: IAvailabilityOfferDto[], nights: number): Room[] =>
  offers.map((offer) => {
    // The API resolves the property's rate plan (meal plan, breakfast, refund
    // terms, strikethrough price); the webview renders it, never invents one.
    const offerPackage = offer.package;
    const packages: RoomPackage[] = [
      {
        id: offerPackage.ratePlanId ? `RP-${offerPackage.ratePlanId}` : `STD-${offer.room.id}`,
        ...(offerPackage.ratePlanId ? { ratePlanId: offerPackage.ratePlanId } : {}),
        name: offerPackage.name,
        mealPlan: offerPackage.mealPlan,
        includesBreakfast: offerPackage.includesBreakfast,
        cancellationPolicy: offerPackage.cancellationPolicy,
        pricePerNight: nights > 0 ? Math.round(toNumber(offer.total) / nights) : 0,
        ...(offerPackage.originalPrice
          ? { originalPricePerNight: Math.round(toNumber(offerPackage.originalPrice)) }
          : {}),
        unitsLeft: offer.stock,
      },
    ];
    // The API may serialize a missing list as null; the same guard the catalog
    // store uses keeps the mapper from throwing on it.
    const roomFacilities = Array.isArray(offer.room.facilities) ? offer.room.facilities : [];
    const facilities =
      roomFacilities.length > 0 ? roomFacilities : offer.room.amenities;

    return {
      id: offer.room.id,
      name: offer.room.name,
      tagline: offer.room.description ?? '',
      sizeSqm: offer.room.sizeSqm ?? 0,
      ...(offer.room.bedType ? { bedType: offer.room.bedType } : {}),
      maxOccupancy: offer.room.capacity,
      images: Array.isArray(offer.room.images) ? (offer.room.images as string[]) : [],
      facilities: parseFacilities(facilities),
      packages,
    } satisfies Room;
  });

export type AvailabilityStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UseAvailabilityResult {
  rooms: Room[];
  status: AvailabilityStatus;
  error: string | null;
  isLoading: boolean;
  retry: () => void;
}

const ERROR_MESSAGE = 'Gagal memuat ketersediaan kamar. Coba lagi.';

export const useAvailability = (search: SearchQuery): UseAvailabilityResult => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [status, setStatus] = useState<AvailabilityStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const apiMode = isNginepEnabled();

  useEffect(() => {
    if (!apiMode || !search.checkIn || !search.checkOut) {
      return;
    }
    let cancelled = false;
    setStatus('loading');
    setError(null);

    searchAvailability({
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      guests: search.guests,
    })
      .then((offers) => {
        if (cancelled) {
          return;
        }
        if (!offers) {
          setRooms([]);
          setStatus('ready');
          return;
        }
        const nights = diffInNights(search.checkIn, search.checkOut);
        const mapped = mapOffersToRooms(offers, nights);
        setRooms(mapped);
        useCatalogStore.getState().applyAvailability(mapped);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setRooms([]);
        setStatus('error');
        setError(ERROR_MESSAGE);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMode, search.checkIn, search.checkOut, search.guests, nonce]);

  const retry = useCallback(() => setNonce((value) => value + 1), []);

  return { rooms, status, error, isLoading: status === 'loading', retry };
};

'use client';

import { useCallback, useEffect, useState } from 'react';
import { isNginepEnabled } from '@/lib/api/config';
import { searchAvailability } from '@/services/availability.service';
import type { IAvailabilityOfferDto } from '@/types/api';
import { diffInNights } from '@/lib/date';
import { parseFacilities } from '@/stores/useCatalogStore';
import type { Room, RoomPackage, SearchQuery } from '@/types/booking';

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Maps flat availability offers to the webview Room shape, one package per offer. */
export const mapOffersToRooms = (offers: IAvailabilityOfferDto[], nights: number): Room[] =>
  offers.map((offer) => {
    const packages: RoomPackage[] = [
      {
        id: `STD-${offer.room.id}`,
        name: 'Harga Terbaik',
        mealPlan: 'ROOM_ONLY',
        includesBreakfast: false,
        cancellationPolicy: 'FREE_CANCELLATION_BEFORE_48H',
        pricePerNight: nights > 0 ? Math.round(toNumber(offer.total) / nights) : 0,
        unitsLeft: offer.stock,
      },
    ];

    return {
      id: offer.room.id,
      name: offer.room.name,
      tagline: offer.room.description ?? '',
      sizeSqm: 0,
      bedType: '1 Queen Bed',
      maxOccupancy: offer.room.capacity,
      images: Array.isArray(offer.room.images) ? (offer.room.images as string[]) : [],
      facilities: [] satisfies ReturnType<typeof parseFacilities>,
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
        setRooms(mapOffersToRooms(offers, nights));
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

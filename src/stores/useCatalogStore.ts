'use client';

import { create } from 'zustand';
import { isNginepEnabled } from '@/lib/api/config';
import { getHotelProfile } from '@/services/hotel.service';
import type { IHotelProfileDto, IRoomDto } from '@/types/api';
import { HOTELS } from '@/data/hotels';
import type { Facility, FacilityId, Hotel, HotelListing, Room, RoomPackage } from '@/types/booking';

/** Label map mirroring FACILITY in `@/data/hotelCatalog` (not exported there). */
export const FACILITY_LABELS: Record<string, string> = {
  wifi: 'WiFi Gratis',
  ac: 'AC Dingin',
  tv: 'Smart TV 43"',
  shower: 'Hot Shower',
  bathtub: 'Bathtub',
  breakfast: 'Sarapan',
  desk: 'Meja Kerja',
  safe: 'Safety Box',
  minibar: 'Mini Bar',
  sofa: 'Sofa',
  non_smoking: 'Non-smoking',
  pool: 'Kolam Renang',
  gym: 'Gym',
  parking: 'Parkir Gratis',
  restaurant: 'Restoran',
};

export const parseFacilities = (value: unknown): Facility[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const facilities: Facility[] = [];
  for (const entry of value) {
    if (typeof entry === 'string') {
      facilities.push({
        id: entry as FacilityId,
        label: FACILITY_LABELS[entry] ?? entry,
      });
      continue;
    }
    if (
      entry &&
      typeof entry === 'object' &&
      typeof (entry as { id?: unknown }).id === 'string'
    ) {
      const record = entry as { id: string; label?: unknown };
      facilities.push({
        id: record.id as FacilityId,
        label:
          typeof record.label === 'string'
            ? record.label
            : FACILITY_LABELS[record.id] ?? record.id,
      });
    }
  }
  return facilities;
};

/** Heuristic from the integration doc: city = last comma-separated address segment. */
const deriveCity = (address: string | null): string => {
  if (!address) {
    return '—';
  }
  const segments = address.split(',').map((segment) => segment.trim()).filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : address;
};

const buildCatalogRoom = (apiRoom: IRoomDto): Room => ({
  id: apiRoom.id,
  name: apiRoom.name,
  tagline: apiRoom.description ?? '',
  sizeSqm: 0,
  bedType: '1 Queen Bed',
  maxOccupancy: apiRoom.capacity,
  images: Array.isArray(apiRoom.images) ? apiRoom.images : [],
  facilities: parseFacilities(
    apiRoom.facilities.length > 0 ? apiRoom.facilities : apiRoom.amenities
  ),
  packages: [
    {
      id: `STD-${apiRoom.id}`,
      name: 'Harga Terbaik',
      mealPlan: 'ROOM_ONLY',
      includesBreakfast: false,
      cancellationPolicy: 'FREE_CANCELLATION_BEFORE_48H',
      pricePerNight: Math.round(Number(apiRoom.basePrice)) || 0,
      unitsLeft: 0,
    } satisfies RoomPackage,
  ],
});

/** Maps the tenant API hotel profile to a webview HotelListing. */
export const buildListing = (
  profile: IHotelProfileDto,
  tenantId: string | null
): HotelListing => {
  const rooms = profile.rooms.filter((apiRoom) => apiRoom.active).map(buildCatalogRoom);
  const heroImage =
    rooms.find((room) => room.images.length > 0)?.images[0] ??
    '/placeholder-hotel.svg';

  const hotel: Hotel = {
    id: tenantId ?? 'hotel',
    name: profile.name,
    address: profile.address ?? '',
    city: deriveCity(profile.address),
    starRating: 0,
    rating: 0,
    reviewCount: 0,
    checkInTime: profile.checkInTime ?? '14:00',
    checkOutTime: profile.checkOutTime ?? '12:00',
    distanceToCenter: '—',
    phone: profile.phone ?? '—',
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      [profile.name, profile.address].filter(Boolean).join(' ')
    )}`,
    heroImage,
    facilities: Array.from(
      new Map(
        rooms.flatMap((room) => room.facilities).map((facility) => [facility.id, facility])
      ).values()
    ),
  };

  return { hotel, rooms };
};

export type CatalogStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Shared resolvers: API-mode ids and mock ids both resolve through these. */
export const getListingById = (listings: HotelListing[], hotelId: string | null): HotelListing | undefined =>
  hotelId ? listings.find((listing) => listing.hotel.id === hotelId) : undefined;

export const findRoomInListings = (listings: HotelListing[], roomId: string | null): Room | undefined => {
  if (!roomId) {
    return undefined;
  }
  for (const listing of listings) {
    const room = listing.rooms.find((item) => item.id === roomId);
    if (room) {
      return room;
    }
  }
  return undefined;
};

export const findPackageInRoom = (room: Room | undefined, packageId: string | null) =>
  room ? room.packages.find((item) => item.id === packageId) ?? room.packages[0] : undefined;

interface CatalogStore {
  listings: HotelListing[];
  status: CatalogStatus;
  error: string | null;
  load: (tenantId: string | null) => Promise<void>;
  clear: () => void;
}

export const useCatalogStore = create<CatalogStore>((set) => ({
  listings: [],
  status: 'idle',
  error: null,

  load: async (tenantId) => {
    set({ status: 'loading', error: null });
    if (!isNginepEnabled()) {
      set({ listings: HOTELS, status: 'ready', error: null });
      return;
    }
    try {
      const profile = await getHotelProfile(tenantId ?? undefined);
      if (!profile) {
        set({ listings: HOTELS, status: 'ready', error: null });
        return;
      }
      set({ listings: [buildListing(profile, tenantId)], status: 'ready', error: null });
    } catch {
      set({
        listings: [],
        status: 'error',
        error: 'Gagal memuat daftar hotel. Periksa koneksi lalu coba lagi.',
      });
    }
  },

  clear: () => set({ listings: [], status: 'idle', error: null }),
}));

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
  // The property describes these on the room; 0 / undefined hides the row.
  sizeSqm: apiRoom.sizeSqm ?? 0,
  ...(apiRoom.bedType ? { bedType: apiRoom.bedType } : {}),
  maxOccupancy: apiRoom.capacity,
  images: Array.isArray(apiRoom.images) ? apiRoom.images : [],
  facilities: parseFacilities(
    apiRoom.facilities.length > 0 ? apiRoom.facilities : apiRoom.amenities
  ),
  packages: [
    {
      // No rate plan travels with the catalog, so the room is sold as its base
      // rate; the availability mapper supplies the real package at checkout.
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
  // Hero order: the property's own hero, then the first room photo, then the
  // bundled placeholder — never a stock image the hotel did not choose.
  const heroImage =
    profile.heroImageUrl ??
    rooms.find((room) => room.images.length > 0)?.images[0] ??
    '/placeholder-hotel.svg';
  const fallbackMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [profile.name, profile.address].filter(Boolean).join(' ')
  )}`;
  const profileFacilities = parseFacilities(profile.facilities ?? []);
  // A property that has not tagged its facilities still shows the union of what
  // its rooms offer, so the hotel card is never empty.
  const facilities =
    profileFacilities.length > 0
      ? profileFacilities
      : Array.from(
          new Map(
            rooms.flatMap((room) => room.facilities).map((facility) => [facility.id, facility])
          ).values()
        );

  const hotel: Hotel = {
    id: tenantId ?? 'hotel',
    name: profile.name,
    address: profile.address ?? '',
    city: profile.city ?? deriveCity(profile.address),
    starRating: profile.starRating ?? 0,
    rating: profile.rating ?? 0,
    reviewCount: profile.reviewCount ?? 0,
    checkInTime: profile.checkInTime || '14:00',
    checkOutTime: profile.checkOutTime || '12:00',
    distanceToCenter: profile.distanceToCenter ?? '—',
    phone: profile.phone ?? '—',
    mapsUrl: profile.mapsUrl ?? fallbackMapsUrl,
    heroImage,
    facilities,
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
  /**
   * Replaces the rooms with the live availability result for the searched stay.
   * Checkout resolves the chosen package from this store, so without it a room
   * picked from the offer list would be re-resolved to its static base rate.
   */
  applyAvailability: (rooms: Room[]) => void;
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

  applyAvailability: (rooms) =>
    set((state) => {
      if (rooms.length === 0) {
        return state;
      }
      const byId = new Map(rooms.map((room) => [room.id, room]));
      return {
        ...state,
        listings: state.listings.map((listing) => ({
          ...listing,
          // Only offers for rooms this property already knows about; an unknown id
          // would invent a room the catalog never loaded.
          rooms: listing.rooms.map((room) => byId.get(room.id) ?? room),
        })),
      };
    }),

  clear: () => set({ listings: [], status: 'idle', error: null }),
}));

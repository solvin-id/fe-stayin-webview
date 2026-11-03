import { describe, expect, it } from 'vitest';
import { HOTELS } from '@/data/hotelCatalog';
import {
  HOTEL_GROUPS,
  getHotelGroupById,
  getHotelGroups,
  getLowestRateInGroup,
} from './hotelGroups';

const catalogIds = new Set(HOTELS.map((listing) => listing.hotel.id));

describe('data grup hotel', () => {
  it('memberi id unik untuk setiap grup', () => {
    const ids = HOTEL_GROUPS.map((group) => group.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('hanya merujuk hotel yang ada di katalog', () => {
    const unknown = HOTEL_GROUPS.flatMap((group) =>
      group.hotelIds.filter((id) => !catalogIds.has(id))
    );
    expect(unknown).toEqual([]);
  });

  it('tiap grup punya minimal satu hotel, layanan, dan profil', () => {
    HOTEL_GROUPS.forEach((group) => {
      expect(group.hotelIds.length).toBeGreaterThan(0);
      expect(group.services.length).toBeGreaterThan(0);
      expect(group.description.length).toBeGreaterThan(20);
      expect(group.tagline.length).toBeGreaterThan(10);
      expect(group.heroImage).toMatch(/^https:\/\//);
    });
  });

  it('tidak menempatkan satu hotel di dua grup', () => {
    const allIds = HOTEL_GROUPS.flatMap((group) => group.hotelIds);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('menggabungkan data grup dengan objek hotel lengkap', () => {
    const groups = getHotelGroups();
    expect(groups).toHaveLength(HOTEL_GROUPS.length);

    groups.forEach((group) => {
      expect(group.hotels).toHaveLength(group.hotelIds.length);
      group.hotels.forEach((hotel) => {
        expect(hotel.name.length).toBeGreaterThan(0);
        expect(hotel.city.length).toBeGreaterThan(0);
      });
    });
  });

  it('mengambil grup berdasarkan id', () => {
    const group = getHotelGroupById('GRP-HORIZON');
    expect(group?.name).toBe('Horizon Hospitality');
    expect(group?.hotels.length).toBe(2);
  });

  it('mengembalikan undefined untuk id kosong atau tidak dikenal', () => {
    expect(getHotelGroupById(null)).toBeUndefined();
    expect(getHotelGroupById('')).toBeUndefined();
    expect(getHotelGroupById('GRP-TIDAK-ADA')).toBeUndefined();
  });

  it('menghitung harga terendah dari seluruh hotel dalam grup', () => {
    const group = getHotelGroupById('GRP-HORIZON');
    expect(group).toBeTruthy();
    if (!group) {
      return;
    }

    const rate = getLowestRateInGroup(group);
    const allRates = group.hotelIds.flatMap(
      (id) =>
        HOTELS.find((listing) => listing.hotel.id === id)?.rooms.flatMap((room) =>
          room.packages.map((roomPackage) => roomPackage.pricePerNight)
        ) ?? []
    );

    expect(rate).toBe(Math.min(...allRates));
    expect(rate).toBeGreaterThan(0);
  });
});
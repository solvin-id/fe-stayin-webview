import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HOTELS } from '@/data/hotelCatalog';
import type { Booking } from '@/types/booking';
import { VoucherDetails } from './VoucherDetails';

const listing = HOTELS[0];
const room = listing.rooms[0];
const roomPackage = room.packages[0];

const bookingWith = (rating: number, reviewCount: number): Booking => ({
  reference: 'STY-2026-TEST01',
  hotel: { ...listing.hotel, rating, reviewCount },
  roomId: room.id,
  roomName: room.name,
  packageId: roomPackage.id,
  packageName: roomPackage.name,
  includesBreakfast: roomPackage.includesBreakfast,
  search: { checkIn: '2026-11-14', checkOut: '2026-11-16', guests: 2, rooms: 1 },
  nights: 2,
  guest: {
    fullName: 'Rian Kusuma',
    email: 'rian.kusuma@example.com',
    phone: '081234567890',
    bookingForOther: false,
    guestName: '',
    specialRequests: [],
    notes: '',
  },
  pricing: {
    pricePerNight: 450_000,
    nights: 2,
    rooms: 1,
    roomTotal: 900_000,
    tax: 90_000,
    discount: 50_000,
    total: 940_000,
  },
  method: 'BCA_VA',
  createdAt: '2026-11-14T08:00:00.000Z',
});

afterEach(cleanup);

describe('VoucherDetails - rating properti', () => {
  it('menampilkan rating dan jumlah ulasan bila properti punya rating', () => {
    render(<VoucherDetails booking={bookingWith(4.6, 128)} />);

    expect(screen.getByText(/4,6/)).toBeTruthy();
    expect(screen.getByText(/128 ulasan/)).toBeTruthy();
  });

  it('tidak mencetak "0,0 · 0 ulasan" untuk properti tanpa rating', () => {
    render(<VoucherDetails booking={bookingWith(0, 0)} />);

    expect(screen.queryByText(/ulasan/)).toBeNull();
    expect(screen.queryByText(/0,0/)).toBeNull();
  });

  it('menampilkan rating tanpa jumlah ulasan bila ulasan belum diimpor', () => {
    render(<VoucherDetails booking={bookingWith(4.2, 0)} />);

    expect(screen.getByText(/4,2/)).toBeTruthy();
    expect(screen.queryByText(/ulasan/)).toBeNull();
  });
});

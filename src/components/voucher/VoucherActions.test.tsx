import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HOTELS } from '@/data/hotelCatalog';
import type { Booking } from '@/types/booking';
import { VoucherActions } from './VoucherActions';

const listing = HOTELS[0];
const room = listing.rooms[0];
const roomPackage = room.packages[0];

const booking: Booking = {
  reference: 'STY-2026-TEST01',
  hotel: listing.hotel,
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
};

const renderActions = () => render(<VoucherActions booking={booking} />);
const whatsAppButton = () =>
  screen.getByRole('button', { name: /Kirim Voucher ke WhatsApp/i });

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('VoucherActions - tombol WhatsApp', () => {
  it('memakai palet hijau WhatsApp, bukan orange CTA', () => {
    renderActions();
    const button = whatsAppButton();

    expect(button.className).toContain('bg-whatsapp');
    expect(button.className).toContain('hover:bg-whatsapp-hover');
    expect(button.className).not.toContain('bg-action');
    expect(button.className).not.toContain('bg-primary');
  });

  it('membuka tautan wa.me saat ditekan', () => {
    const open = vi.fn();
    vi.stubGlobal('open', open);

    renderActions();
    fireEvent.click(whatsAppButton());

    expect(open).toHaveBeenCalledTimes(1);
    expect(String(open.mock.calls[0][0])).toMatch(/^https:\/\/wa\.me\/\?text=/);
  });

  it('tidak menulari tombol lain dengan warna hijau', () => {
    renderActions();

    expect(screen.getByRole('button', { name: /Download Ringkasan/i }).className).not.toContain(
      'bg-whatsapp'
    );
    expect(screen.getByRole('button', { name: /Cari Hotel Lain/i }).className).not.toContain(
      'bg-whatsapp'
    );
  });
});
import { addDays } from '@/lib/date';
import type {
  GuestDetails,
  PaymentMethodId,
  PaymentMethodMeta,
  SearchQuery,
  SpecialRequestId,
} from '@/types/booking';

export const PAYMENT_METHODS: PaymentMethodMeta[] = [
  {
    id: 'BCA_VA',
    name: 'BCA Virtual Account',
    group: 'Virtual Account',
    description: 'Bayar lewat m-BCA atau ATM',
    badge: 'BCA',
    vaNumber: '8271081234567890',
  },
  {
    id: 'MANDIRI_VA',
    name: 'Mandiri Virtual Account',
    group: 'Virtual Account',
    description: 'Bayar lewat Livin by Mandiri',
    badge: 'MDR',
    vaNumber: '8950801234567890',
  },
  {
    id: 'QRIS',
    name: 'GoPay / QRIS',
    group: 'E-Wallet & QR',
    description: 'Scan QR dengan GoPay, OVO, atau ShopeePay',
    badge: 'QRIS',
    qrPayload: 'STAYIN-PAY',
  },
  {
    id: 'CREDIT_CARD',
    name: 'Kartu Kredit / Debit',
    group: 'Kartu',
    description: 'Visa, Mastercard, JCB',
    badge: 'CARD',
  },
];

export const SPECIAL_REQUESTS: Array<{ id: SpecialRequestId; label: string }> = [
  { id: 'NON_SMOKING', label: 'Bebas Asap Rokok' },
  { id: 'HIGH_FLOOR', label: 'Lantai Tinggi' },
  { id: 'CONNECTING_ROOM', label: 'Connecting Room' },
  { id: 'LARGE_BED', label: 'Ranjang Besar' },
];

/** Tomorrow-to-day-after: a search that never starts in the past. */
export const buildDefaultSearch = (today: string): SearchQuery => ({
  checkIn: addDays(today, 1),
  checkOut: addDays(today, 3),
  guests: 2,
  rooms: 1,
});

/** API mode starts with an empty form; `useGuestProfile` fills what the host vouches for. */
export const BLANK_GUEST: GuestDetails = {
  fullName: '',
  email: '',
  phone: '',
  bookingForOther: false,
  guestName: '',
  specialRequests: [],
  notes: '',
};

export const GUEST_PROFILE: GuestDetails = {
  fullName: 'Rian Kusuma',
  email: 'rian.kusuma@example.com',
  phone: '081234567890',
  bookingForOther: false,
  guestName: '',
  specialRequests: ['NON_SMOKING'],
  notes: '',
};

export const getPaymentMethod = (methodId: PaymentMethodId): PaymentMethodMeta =>
  PAYMENT_METHODS.find((method) => method.id === methodId) ?? PAYMENT_METHODS[0];

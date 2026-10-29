import type { GuestDetails } from '@/types/booking';

export interface GuestFormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  guestName?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PHONE_PATTERN = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;

export const validateGuest = (guest: GuestDetails): GuestFormErrors => {
  const errors: GuestFormErrors = {};

  if (guest.fullName.trim().length < 3) {
    errors.fullName = 'Nama lengkap minimal 3 karakter.';
  }

  if (!EMAIL_PATTERN.test(guest.email.trim())) {
    errors.email = 'Format email belum benar.';
  }

  if (!PHONE_PATTERN.test(guest.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Nomor WhatsApp tidak valid (contoh: 081234567890).';
  }

  if (guest.bookingForOther && guest.guestName.trim().length < 3) {
    errors.guestName = 'Nama tamu menginap wajib diisi.';
  }

  return errors;
};

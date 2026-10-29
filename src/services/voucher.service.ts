import { getPaymentMethod } from '@/data/mockData';
import { formatCurrency, formatDateWithDay } from '@/lib/formatters';
import type { Booking } from '@/types/booking';

export const buildVoucherText = (booking: Booking): string => {
  const method = getPaymentMethod(booking.method);
  const guestName = booking.guest.bookingForOther
    ? booking.guest.guestName
    : booking.guest.fullName;

  return [
    'E-VOUCHER STAYIN',
    '================',
    `Kode Reservasi : ${booking.reference}`,
    `Hotel          : ${booking.hotel.name}`,
    `Alamat         : ${booking.hotel.address}, ${booking.hotel.city}`,
    `Check-in       : ${formatDateWithDay(booking.search.checkIn)} (mulai ${booking.hotel.checkInTime})`,
    `Check-out      : ${formatDateWithDay(booking.search.checkOut)} (sebelum ${booking.hotel.checkOutTime})`,
    `Kamar          : ${booking.roomName} - ${booking.packageName}`,
    `Tamu Menginap  : ${guestName}`,
    `Jumlah Tamu    : ${booking.search.guests} tamu, ${booking.search.rooms} kamar`,
    `Total Bayar    : ${formatCurrency(booking.pricing.total)} (LUNAS)`,
    `Metode Bayar   : ${method.name}`,
    '',
    'Tunjukkan voucher ini beserta identitas saat check-in.',
  ].join('\n');
};

export const buildWhatsAppUrl = (booking: Booking): string =>
  `https://wa.me/?text=${encodeURIComponent(buildVoucherText(booking))}`;

export const downloadVoucherSummary = (booking: Booking): void => {
  const blob = new Blob([buildVoucherText(booking)], {
    type: 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Stayin-Voucher-${booking.reference}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

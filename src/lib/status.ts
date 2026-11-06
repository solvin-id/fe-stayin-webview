/** Booking status labels shared by the payment screen and the voucher. */
export const SERVER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  PENDING: 'Menunggu Pembayaran',
  CONFIRMED: 'Terkonfirmasi',
  CHECKED_IN: 'Sedang Menginap',
  CHECKED_OUT: 'Selesai',
  NO_SHOW: 'Tidak Hadir',
  CANCELLED: 'Dibatalkan',
  EXPIRED: 'Kedaluwarsa',
};

export const serverStatusLabel = (status: string | null | undefined): string =>
  status ? (SERVER_STATUS_LABELS[status] ?? status) : 'Menunggu Pembayaran';

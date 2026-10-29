import type { PriceSummary } from '@/types/booking';

export const TAX_RATE = 0.1;

export const PROMO_DISCOUNT = 50_000;

export const PAYMENT_WINDOW_SECONDS = 15 * 60;

export const buildPriceSummary = (
  pricePerNight: number,
  nights: number,
  rooms: number
): PriceSummary => {
  const safeNights = Math.max(1, nights);
  const safeRooms = Math.max(1, rooms);
  const roomTotal = pricePerNight * safeNights * safeRooms;
  const tax = Math.round(roomTotal * TAX_RATE);
  const discount = Math.min(PROMO_DISCOUNT, roomTotal);

  return {
    pricePerNight,
    nights: safeNights,
    rooms: safeRooms,
    roomTotal,
    tax,
    discount,
    total: roomTotal + tax - discount,
  };
};

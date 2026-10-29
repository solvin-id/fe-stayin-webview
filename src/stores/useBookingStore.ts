'use client';

import { create } from 'zustand';
import { getHotelById, getPackageById, getRoomById } from '@/data/hotels';
import { DEFAULT_SEARCH, GUEST_PROFILE } from '@/data/mockData';
import { diffInNights } from '@/lib/date';
import { PAYMENT_WINDOW_SECONDS, buildPriceSummary } from '@/lib/pricing';
import type {
  Booking,
  BookingStep,
  GuestDetails,
  PaymentInfo,
  PaymentMethodId,
  SearchQuery,
  SpecialRequestId,
  ToastMessage,
  ToastTone,
} from '@/types/booking';

const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateBookingReference = (): string => {
  let code = '';
  for (let index = 0; index < 5; index += 1) {
    code += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `STY-${new Date().getFullYear()}-${code}`;
};

const initialPayment: PaymentInfo = {
  method: 'BCA_VA',
  status: 'IDLE',
  expiresAt: null,
  paidAt: null,
};

interface BookingStore {
  step: BookingStep;
  search: SearchQuery;
  hotelQuery: string;
  cityFilter: string | null;
  selectedHotelId: string | null;
  selectedRoomId: string | null;
  selectedPackageId: string | null;
  guest: GuestDetails;
  payment: PaymentInfo;
  booking: Booking | null;
  toast: ToastMessage | null;
  selectHotel: (hotelId: string) => void;
  openRoomDetail: (roomId: string, packageId: string) => void;
  closeRoomDetail: () => void;
  goToStep: (step: BookingStep) => void;
  setSearch: (search: SearchQuery) => void;
  setHotelQuery: (query: string) => void;
  setCityFilter: (city: string | null) => void;
  resetHotelFilters: () => void;
  updateGuest: (patch: Partial<GuestDetails>) => void;
  toggleSpecialRequest: (id: SpecialRequestId) => void;
  selectPackage: (packageId: string) => void;
  setPaymentMethod: (method: PaymentMethodId) => void;
  startPayment: () => void;
  confirmPayment: () => void;
  expirePayment: () => void;
  restartAfterExpiry: () => void;
  startNewBooking: () => void;
  showToast: (message: string, tone?: ToastTone) => void;
  hideToast: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  step: 1,
  search: DEFAULT_SEARCH,
  hotelQuery: '',
  cityFilter: null,
  selectedHotelId: null,
  selectedRoomId: null,
  selectedPackageId: null,
  guest: GUEST_PROFILE,
  payment: initialPayment,
  booking: null,
  toast: null,

  selectHotel: (hotelId) =>
    set({
      step: 2,
      selectedHotelId: hotelId,
      selectedRoomId: null,
      selectedPackageId: null,
      booking: null,
      payment: initialPayment,
    }),

  openRoomDetail: (roomId, packageId) =>
    set({ step: 3, selectedRoomId: roomId, selectedPackageId: packageId }),

  closeRoomDetail: () => set({ step: 2 }),

  goToStep: (step) => set({ step }),

  setSearch: (search) => set({ search }),

  setHotelQuery: (hotelQuery) => set({ hotelQuery }),

  setCityFilter: (cityFilter) => set({ cityFilter }),

  resetHotelFilters: () => set({ hotelQuery: '', cityFilter: null }),

  updateGuest: (patch) =>
    set((state) => ({ guest: { ...state.guest, ...patch } })),

  toggleSpecialRequest: (id) =>
    set((state) => {
      const exists = state.guest.specialRequests.includes(id);
      return {
        guest: {
          ...state.guest,
          specialRequests: exists
            ? state.guest.specialRequests.filter((item) => item !== id)
            : [...state.guest.specialRequests, id],
        },
      };
    }),

  selectPackage: (packageId) => set({ selectedPackageId: packageId }),

  setPaymentMethod: (method) =>
    set((state) => ({ payment: { ...state.payment, method } })),

  startPayment: () => {
    const state = get();
    const hotel = getHotelById(state.selectedHotelId);
    const room = getRoomById(state.selectedRoomId);
    const roomPackage = getPackageById(room, state.selectedPackageId);

    if (!hotel || !room || !roomPackage) {
      return;
    }

    const nights = diffInNights(state.search.checkIn, state.search.checkOut);
    const pricing = buildPriceSummary(
      roomPackage.pricePerNight,
      nights,
      state.search.rooms
    );

    set({
      step: 5,
      booking: {
        reference: generateBookingReference(),
        hotel,
        roomId: room.id,
        roomName: room.name,
        packageId: roomPackage.id,
        packageName: roomPackage.name,
        includesBreakfast: roomPackage.includesBreakfast,
        search: { ...state.search },
        nights,
        guest: { ...state.guest },
        pricing,
        method: state.payment.method,
        createdAt: new Date().toISOString(),
      },
      payment: {
        ...state.payment,
        status: 'PENDING',
        expiresAt: Date.now() + PAYMENT_WINDOW_SECONDS * 1000,
        paidAt: null,
      },
    });
  },

  confirmPayment: () =>
    set((state) => ({
      step: 6,
      payment: {
        ...state.payment,
        status: 'PAID',
        paidAt: new Date().toISOString(),
        expiresAt: null,
      },
      toast: {
        id: Date.now(),
        message: 'Pembayaran berhasil dikonfirmasi.',
        tone: 'success',
      },
    })),

  expirePayment: () =>
    set((state) => ({
      payment: { ...state.payment, status: 'EXPIRED', expiresAt: null },
    })),

  restartAfterExpiry: () => {
    const hotelId = get().selectedHotelId;
    set({
      step: hotelId ? 2 : 1,
      booking: null,
      payment: initialPayment,
      selectedRoomId: null,
      selectedPackageId: null,
    });
  },

  startNewBooking: () =>
    set({
      step: 1,
      hotelQuery: '',
      cityFilter: null,
      selectedHotelId: null,
      selectedRoomId: null,
      selectedPackageId: null,
      booking: null,
      payment: initialPayment,
    }),

  showToast: (message, tone = 'info') =>
    set({ toast: { id: Date.now(), message, tone } }),

  hideToast: () => set({ toast: null }),
}));

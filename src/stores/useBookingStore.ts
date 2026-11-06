'use client';

import { create } from 'zustand';
import { BLANK_GUEST, GUEST_PROFILE, buildDefaultSearch } from '@/data/mockData';
import { isNginepEnabled } from '@/lib/api/config';
import { NginepApiError } from '@/lib/api/errors';
import { createBooking, randomKey } from '@/services/booking.service';
import { getBookingStatus } from '@/services/payment.service';
import {
  findPackageInRoom,
  findRoomInListings,
  getListingById,
  useCatalogStore,
} from '@/stores/useCatalogStore';
import { diffInNights, todayISO } from '@/lib/date';
import { DEFAULT_PAYMENT_WINDOW_MS, buildPriceSummary } from '@/lib/pricing';
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
  activeGroupId: string | null;
  /** True while confirmPayment's status-polling loop is running. */
  pollingActive: boolean;
  /** Stable per-submission idempotency key, reused across retries of one intent. */
  bookingIdempotencyKey: string | null;
  /** Token from the last successful quote; locks the price when booking. */
  quoteToken: string | null;
  /** Server already reported the payment as settled (gateway webhook landed). */
  completeServerPayment: () => void;
  openGroup: (groupId: string) => void;
  closeGroup: () => void;
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
  startPayment: () => Promise<void>;
  confirmPayment: () => Promise<void>;
  expirePayment: () => void;
  restartAfterExpiry: () => void;
  setQuoteToken: (token: string | null) => void;
  startNewBooking: () => void;
  showToast: (message: string, tone?: ToastTone) => void;
  hideToast: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  step: 1,
  search: buildDefaultSearch(todayISO()),
  hotelQuery: '',
  cityFilter: null,
  selectedHotelId: null,
  selectedRoomId: null,
  selectedPackageId: null,
  guest: isNginepEnabled() ? BLANK_GUEST : GUEST_PROFILE,
  payment: initialPayment,
  booking: null,
  toast: null,
  activeGroupId: null,
  pollingActive: false,
  bookingIdempotencyKey: null,
  quoteToken: null,

  openGroup: (activeGroupId) => set({ activeGroupId }),

  closeGroup: () => set({ activeGroupId: null }),

  selectHotel: (hotelId) =>
    set({
      step: 2,
      activeGroupId: null,
      selectedHotelId: hotelId,
      selectedRoomId: null,
      selectedPackageId: null,
      booking: null,
      payment: initialPayment,
      quoteToken: null,
    }),

  openRoomDetail: (roomId, packageId) =>
    set({ step: 3, selectedRoomId: roomId, selectedPackageId: packageId }),

  closeRoomDetail: () => set({ step: 2 }),

  goToStep: (step) => set({ step }),

  setSearch: (search) => set({ search }),

  setQuoteToken: (quoteToken) => set({ quoteToken }),

  completeServerPayment: () =>
    set((state) => ({
      step: 6,
      pollingActive: false,
      booking: state.booking
        ? { ...state.booking, serverStatus: 'CONFIRMED' }
        : state.booking,
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

  startPayment: async () => {
    const state = get();
    const listings = useCatalogStore.getState().listings;
    const listing = getListingById(listings, state.selectedHotelId);
    const room = findRoomInListings(listings, state.selectedRoomId);
    const roomPackage = findPackageInRoom(room, state.selectedPackageId);

    if (!listing || !room || !roomPackage) {
      // Stale/mismatched selection (e.g. hotel id not in current catalog): surface
      // it instead of silently booking a different property.
      set({
        toast: {
          id: Date.now(),
          message: 'Pilihan hotel atau kamar tidak valid. Muat ulang daftar hotel.',
          tone: 'error',
        },
      });
      return;
    }
    const hotel = listing.hotel;

    const nights = diffInNights(state.search.checkIn, state.search.checkOut);

    if (isNginepEnabled()) {
      set({ step: 4 });
      try {
        // Stable key per submission intent: a retry after a lost response replays
        // the same booking instead of double-booking (server resolveReplay).
        const idempotencyKey = get().bookingIdempotencyKey ?? randomKey();
        set({ bookingIdempotencyKey: idempotencyKey });
        const result = await createBooking(
          {
            checkIn: state.search.checkIn,
            checkOut: state.search.checkOut,
            guests: state.search.guests,
            roomId: room.id,
            guestName: state.guest.bookingForOther
              ? state.guest.guestName
              : state.guest.fullName,
            guestEmail: state.guest.email,
            guestPhone: state.guest.phone,
            // What the guest picked at checkout, plus the package they bought.
            specialRequests: state.guest.specialRequests,
            notes: state.guest.notes,
            ...(roomPackage.ratePlanId ? { ratePlanId: roomPackage.ratePlanId } : {}),
            ...(state.quoteToken ? { quoteToken: state.quoteToken } : {}),
          },
          undefined,
          idempotencyKey,
        );
        if (!result) {
          return;
        }
        const current = get();
        const record = result.booking;
        set({
          step: 5,
          booking: {
            reference: record.code,
            hotel,
            roomId: room.id,
            roomName: room.name,
            packageId: roomPackage.id,
            packageName: roomPackage.name,
            includesBreakfast: roomPackage.includesBreakfast,
            search: { ...state.search },
            nights,
            guest: { ...state.guest },
            pricing: {
              pricePerNight: roomPackage.pricePerNight,
              nights,
              rooms: 1, // API books exactly one room per booking.
              roomTotal: Number(record.subtotal),
              tax: Number(record.taxAmount),
              discount: Number(record.discountAmount),
              total: Number(record.total),
            },
            method: current.payment.method,
            createdAt: new Date().toISOString(),
            bookingCodes: [record.code],
            bookingIds: [record.id],
            serverStatus: record.status,
          },
          payment: {
            ...current.payment,
            status: 'PENDING',
            // The server owns the deadline: it is the same number the sweep and
            // the gateway expire on.
            expiresAt: record.holdExpiresAt
              ? new Date(record.holdExpiresAt).getTime()
              : Date.now() + DEFAULT_PAYMENT_WINDOW_MS,
            paidAt: null,
          },
        });
      } catch (error) {
        const message =
          error instanceof NginepApiError
            ? error.message
            : 'Gagal membuat pemesanan.';
        get().showToast(message, 'error');
        set({ step: 4 });
      }
      return;
    }

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
        expiresAt: Date.now() + DEFAULT_PAYMENT_WINDOW_MS,
        paidAt: null,
      },
    });
  },

  confirmPayment: async () => {
    if (!isNginepEnabled()) {
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
      }));
      return;
    }

    const reference = get().booking?.reference;
    if (!reference) {
      return;
    }
    // Re-entry guard: a second tap while polling must not spawn another loop.
    if (get().pollingActive) {
      return;
    }
    set({ pollingActive: true });

    const POLL_INTERVAL_MS = 5000;
    const MAX_ATTEMPTS = 60;

    set({
      toast: {
        id: Date.now(),
        message: 'Menunggu konfirmasi pembayaran',
        tone: 'info',
      },
    });

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      if (get().step !== 5 || get().payment.status === 'EXPIRED') {
        set({ pollingActive: false });
        return;
      }
      const { promise: delay, resolve: tick } = Promise.withResolvers<void>();
      setTimeout(tick, POLL_INTERVAL_MS);
      await delay;
      if (get().step !== 5 || get().payment.status === 'EXPIRED') {
        set({ pollingActive: false });
        return;
      }
      try {
        const statusResult = await getBookingStatus(reference);
        const status = statusResult?.status ?? null;
        const serverExpiresAt = statusResult?.holdExpiresAt
          ? new Date(statusResult.holdExpiresAt).getTime()
          : null;
        if (status === 'EXPIRED' || status === 'CANCELLED') {
          set((state) => ({
            pollingActive: false,
            booking:
              state.booking && status
                ? { ...state.booking, serverStatus: status }
                : state.booking,
            payment: { ...state.payment, status: 'EXPIRED', expiresAt: null },
          }));
          return;
        }
        set((state) => ({
          booking:
            state.booking && status
              ? { ...state.booking, serverStatus: status }
              : state.booking,
          payment: serverExpiresAt
            ? { ...state.payment, expiresAt: serverExpiresAt }
            : state.payment,
        }));
        if (status === 'CONFIRMED') {
          set((state) => ({
            step: 6,
            pollingActive: false,
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
          }));
          return;
        }
      } catch {
        // Transient polling error: keep retrying until attempts exhausted.
      }
    }
    set({ pollingActive: false });

    if (get().step === 5) {
      get().showToast(
        'Konfirmasi pembayaran belum terverifikasi. Coba lagi nanti.',
        'warning'
      );
    }
  },

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
      quoteToken: null,
      selectedRoomId: null,
      selectedPackageId: null,
    });
  },

  startNewBooking: () =>
    set({
      step: 1,
      hotelQuery: '',
      cityFilter: null,
      activeGroupId: null,
      selectedHotelId: null,
      selectedRoomId: null,
      selectedPackageId: null,
      booking: null,
      payment: initialPayment,
      pollingActive: false,
      bookingIdempotencyKey: null,
      quoteToken: null,
    }),

  showToast: (message, tone = 'info') =>
    set({ toast: { id: Date.now(), message, tone } }),

  hideToast: () => set({ toast: null }),
}));

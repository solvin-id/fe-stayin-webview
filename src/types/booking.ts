export type BedType =
  | '2 Twin Beds'
  | '1 Queen Bed'
  | '1 King Bed'
  | '1 King Bed + Sofa Bed';

export type CancellationPolicy = 'NON_REFUNDABLE' | 'FREE_CANCELLATION_BEFORE_48H';

export type MealPlan = 'ROOM_ONLY' | 'BREAKFAST';

export type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

export type PaymentMethodId = 'BCA_VA' | 'MANDIRI_VA' | 'QRIS' | 'CREDIT_CARD';

export type PaymentStatus = 'IDLE' | 'PENDING' | 'PAID' | 'EXPIRED';

export type SpecialRequestId =
  | 'NON_SMOKING'
  | 'HIGH_FLOOR'
  | 'CONNECTING_ROOM'
  | 'LARGE_BED';

export type FacilityId =
  | 'wifi'
  | 'ac'
  | 'tv'
  | 'shower'
  | 'bathtub'
  | 'breakfast'
  | 'desk'
  | 'safe'
  | 'minibar'
  | 'sofa'
  | 'non_smoking'
  | 'pool'
  | 'gym'
  | 'parking'
  | 'restaurant';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface Facility {
  id: FacilityId;
  label: string;
}

export interface RoomPackage {
  id: string;
  name: string;
  mealPlan: MealPlan;
  includesBreakfast: boolean;
  cancellationPolicy: CancellationPolicy;
  pricePerNight: number;
  originalPricePerNight?: number;
  unitsLeft: number;
}

export interface Room {
  id: string;
  name: string;
  tagline: string;
  sizeSqm: number;
  bedType: BedType;
  maxOccupancy: number;
  images: string[];
  facilities: Facility[];
  packages: RoomPackage[];
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  starRating: number;
  rating: number;
  reviewCount: number;
  checkInTime: string;
  checkOutTime: string;
  distanceToCenter: string;
  phone: string;
  mapsUrl: string;
  heroImage: string;
  facilities: Facility[];
}

export interface HotelListing {
  hotel: Hotel;
  rooms: Room[];
}

export interface CityOption {
  city: string;
  count: number;
}

export interface SearchQuery {
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface GuestDetails {
  fullName: string;
  email: string;
  phone: string;
  bookingForOther: boolean;
  guestName: string;
  specialRequests: SpecialRequestId[];
  notes: string;
}

export interface PriceSummary {
  pricePerNight: number;
  nights: number;
  rooms: number;
  roomTotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface PaymentInfo {
  method: PaymentMethodId;
  status: PaymentStatus;
  expiresAt: number | null;
  paidAt: string | null;
}

export interface PaymentMethodMeta {
  id: PaymentMethodId;
  name: string;
  group: string;
  description: string;
  badge: string;
  vaNumber?: string;
  qrPayload?: string;
}

export interface Booking {
  reference: string;
  hotel: Hotel;
  roomId: string;
  roomName: string;
  packageId: string;
  packageName: string;
  includesBreakfast: boolean;
  search: SearchQuery;
  nights: number;
  guest: GuestDetails;
  pricing: PriceSummary;
  method: PaymentMethodId;
  createdAt: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

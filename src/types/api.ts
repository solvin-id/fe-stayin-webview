/** Tenant hotel profile as returned by GET /api/storefront/hotel-profile. */
export interface ITenantDto {
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  description: string | null;
  /** "Hotel Bintang N"; 0 hides the label. */
  starRating: number;
  /** Aggregate imported from the OTAs by the property admin. */
  rating: number;
  reviewCount: number;
  distanceToCenter: string | null;
  mapsUrl: string | null;
  checkInTime: string;
  checkOutTime: string;
  heroImageUrl: string | null;
  galleryUrls: string[];
  facilities: string[];
  currency: string;
  rooms: IRoomDto[];
}

/** Storefront projection of one room. */
export interface IRoomDto {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  /** Floor area in m²; null when the property does not describe it. */
  sizeSqm: number | null;
  /** Free-text bed description set by the property ("1 King Bed"). */
  bedType: string | null;
  basePrice: string;
  images: string[];
  amenities: string[];
  facilities: string[];
  active: boolean;
}

/** One per-night price point for a room offer. */
export interface IPricePerNight {
  date: string;
  price: string;
}

/** The package an offer is sold as: the room's rate plan, or a "Harga Terbaik" default. */
export interface IOfferPackageDto {
  ratePlanId: string | null;
  name: string;
  mealPlan: 'ROOM_ONLY' | 'BREAKFAST';
  includesBreakfast: boolean;
  cancellationPolicy: 'NON_REFUNDABLE' | 'FREE_CANCELLATION_BEFORE_48H';
  originalPrice: string | null;
}

/** One room's availability result for a stay range (POST /api/availability).
 *  Upstream returns the full room row nested — see availability.interface.ts IRoomOffer. */
export interface IAvailabilityOfferDto {
  room: IRoomDto;
  package: IOfferPackageDto;
  pricePerNight: IPricePerNight[];
  total: string;
  stock: number;
}

/** POST /api/storefront/quote — the server-computed checkout breakdown. */
export interface IQuoteDto {
  roomId: string;
  nights: number;
  pricePerNight: string;
  subtotal: string;
  serviceAmount: string;
  taxAmount: string;
  discountAmount: string;
  total: string;
  currency: string;
  promoCode: string | null;
  /** Signed, short-lived token the booking posts back to lock this price. */
  quoteToken: string;
}

/** Money fields are decimal strings to avoid float rounding. */
/** POST /api/booking returns the created Prisma Booking nested, plus replay status. */
export interface IBookingResponse {
  booking: IBookingRecordDto;
  paymentToken: string | null;
  bookingStatus: 'CREATED' | 'EXISTS';
}

/** Prisma Booking row as serialized by Nest (Decimal → string, Date → ISO string). */
export interface IBookingRecordDto {
  id: string;
  tenantId: string;
  code: string;
  status: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  total: string;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  serviceAmount: string;
  createdAt: string;
  /** Payment deadline; null only for rows that predate universal holds. */
  holdExpiresAt?: string | null;
}

/**
 * Booking status lookup by public code (GET /api/storefront/bookings/:code).
 * Deliberately narrower than a booking row: guests get no email/phone/tenant id.
 */
export interface IBookingsStatusDto {
  code: string;
  status: string;
  total: string;
  subtotal: string;
  taxAmount: string;
  discountAmount: string;
  serviceAmount: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  createdAt: string;
  holdExpiresAt: string | null;
}

/** POST /api/storefront/guest-session — the host's signed guest identity. */
export interface IGuestProfileDto {
  name: string | null;
  email: string | null;
  phone: string | null;
}

/** GET /api/storefront/bookings/:code/payment — server-issued payment instrument. */
export interface IPaymentInstructionDto {
  method: string;
  status: string;
  vaNumber: string | null;
  billerCode: string | null;
  billKey: string | null;
  qrString: string | null;
  expiresAt: string | null;
  chargedAt: string | null;
}

export type IHotelProfileDto = ITenantDto;

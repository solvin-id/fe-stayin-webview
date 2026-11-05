/** Tenant hotel profile as returned by GET /api/storefront/hotel-profile. */
export interface ITenantDto {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  taxRate: string | null;
  currency: string;
  rooms: IRoomDto[];
}

/** Storefront projection of one room. */
export interface IRoomDto {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
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

/** One room's availability result for a stay range (POST /api/availability).
 *  Upstream returns the full room row nested — see availability.interface.ts IRoomOffer. */
export interface IAvailabilityOfferDto {
  room: IRoomDto;
  pricePerNight: IPricePerNight[];
  total: string;
  stock: number;
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
}

/** Booking status lookup by public code (GET /api/storefront/bookings/:code) — flat shape. */
export type IBookingsStatusDto = IBookingRecordDto;

export type IHotelProfileDto = ITenantDto;

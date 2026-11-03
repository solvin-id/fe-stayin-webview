import { HOTELS } from '@/data/hotelCatalog';
import { buildCityOptions } from '@/lib/hotelFilter';
import type { CityOption, Hotel, HotelListing, Room } from '@/types/booking';

export { HOTELS };

export const getHotelListing = (hotelId: string | null): HotelListing | undefined =>
  HOTELS.find((listing) => listing.hotel.id === hotelId);

export const getHotelById = (hotelId: string | null) => getHotelListing(hotelId)?.hotel;

export const getRoomsByHotel = (hotelId: string | null): Room[] =>
  getHotelListing(hotelId)?.rooms ?? [];

export const getRoomById = (roomId: string | null): Room | undefined => {
  if (!roomId) {
    return undefined;
  }
  for (const listing of HOTELS) {
    const room = listing.rooms.find((item) => item.id === roomId);
    if (room) {
      return room;
    }
  }
  return undefined;
};

export const getHotelByRoomId = (roomId: string | null): Hotel | undefined => {
  if (!roomId) {
    return undefined;
  }
  return HOTELS.find((listing) => listing.rooms.some((room) => room.id === roomId))?.hotel;
};

export const getPackageById = (room: Room | undefined, packageId: string | null) =>
  room?.packages.find((roomPackage) => roomPackage.id === packageId);

export const getLowestNightlyRate = (hotelId?: string | null): number => {
  const listings = hotelId
    ? HOTELS.filter((listing) => listing.hotel.id === hotelId)
    : HOTELS;
  const rates = listings.flatMap((listing) =>
    listing.rooms.flatMap((room) => room.packages.map((roomPackage) => roomPackage.pricePerNight))
  );
  if (rates.length === 0) {
    return 0;
  }
  return Math.min(...rates);
};

export const getCityOptions = (): CityOption[] => buildCityOptions(HOTELS);

import type { CityOption, HotelListing } from '@/types/booking';

const normalize = (value: string): string => value.toLowerCase().trim();

const matchesQuery = (listing: HotelListing, query: string): boolean => {
  if (!query) {
    return true;
  }
  const { hotel } = listing;
  return [hotel.name, hotel.city, hotel.address].some((field) =>
    normalize(field).includes(query)
  );
};

export const filterHotels = (
  listings: HotelListing[],
  query: string,
  city: string | null
): HotelListing[] => {
  const keyword = normalize(query);
  return listings.filter(
    (listing) =>
      matchesQuery(listing, keyword) && (!city || listing.hotel.city === city)
  );
};

export const buildCityOptions = (listings: HotelListing[]): CityOption[] => {
  const counts = new Map<string, number>();
  for (const listing of listings) {
    const city = listing.hotel.city;
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }
  return Array.from(counts, ([city, count]) => ({ city, count })).sort(
    (left, right) => right.count - left.count || left.city.localeCompare(right.city)
  );
};

import { SearchX } from 'lucide-react';
import { HotelCard } from '@/components/hotels/HotelCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { getLowestNightlyRate } from '@/data/hotels';
import type { HotelListing } from '@/types/booking';

interface HotelListProps {
  listings: HotelListing[];
  onSelectHotel: (hotelId: string) => void;
  onReset: () => void;
}

export const HotelListSkeleton = () => (
  <div className="space-y-2.5">
    {[0, 1, 2].map((item) => (
      <div
        key={item}
        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card"
      >
        <Skeleton className="h-40 w-full rounded-none" />
        <div className="space-y-2.5 p-3.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="flex items-end justify-between pt-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-11 w-28 rounded-xl" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const HotelList = ({ listings, onSelectHotel, onReset }: HotelListProps) => {
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-card">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <SearchX size={22} />
        </span>
        <p className="mt-2.5 text-[14px] font-bold text-slate-900">Hotel tidak ditemukan</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          Coba kata kunci lain atau ubah filter kota yang dipilih.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-3 inline-flex min-h-[44px] items-center rounded-xl bg-primary-surface px-4 text-[12px] font-bold text-primary active:bg-primary/15"
        >
          Reset Pencarian
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {listings.map((listing) => (
        <HotelCard
          key={listing.hotel.id}
          listing={listing}
          lowestRate={getLowestNightlyRate(listing.hotel.id)}
          onOpen={() => onSelectHotel(listing.hotel.id)}
        />
      ))}
    </div>
  );
};

'use client';

import Image from 'next/image';
import { ChevronRight, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FacilityIcon } from '@/components/room/FacilityIcon';
import { formatCurrency, formatDecimal, formatReviewCount } from '@/lib/formatters';
import type { HotelListing } from '@/types/booking';

interface HotelCardProps {
  listing: HotelListing;
  lowestRate: number;
  onOpen: () => void;
}

export const HotelCard = ({ listing, lowestRate, onOpen }: HotelCardProps) => {
  const { hotel, rooms } = listing;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Lihat kamar ${hotel.name}`}
        className="relative block h-40 w-full"
      >
        <Image
          src={hotel.heroImage}
          alt={hotel.name}
          fill
          sizes="480px"
          className="object-cover"
        />
        <span className="absolute left-2 top-2 rounded-md bg-slate-900/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
          Hotel Bintang {hotel.starRating}
        </span>
      </button>

      <div className="px-3.5 pb-3 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[16px] font-bold text-slate-900">{hotel.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] leading-relaxed text-slate-500">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">
                {hotel.address}, {hotel.city}
              </span>
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            {formatDecimal(hotel.rating)}
          </span>
        </div>

        <p className="mt-1 text-[10px] text-slate-400">
          {formatReviewCount(hotel.reviewCount)} ulasan · {hotel.distanceToCenter} ·{' '}
          {rooms.length} tipe kamar
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {hotel.facilities.slice(0, 3).map((facility) => (
            <Badge key={facility.id} tone="neutral" className="text-[10px]">
              <FacilityIcon id={facility.id} size={11} /> {facility.label}
            </Badge>
          ))}
        </div>

        <div className="mt-2.5 flex items-end justify-between gap-2 border-t border-slate-100 pt-2.5">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500">Mulai dari</p>
            <p className="truncate text-[17px] font-bold leading-tight text-primary">
              {formatCurrency(lowestRate)}
              <span className="ml-0.5 text-[11px] font-medium text-slate-500">/malam</span>
            </p>
          </div>
          <Button variant="action" size="sm" onClick={onOpen} className="shrink-0 gap-0.5">
            Lihat Kamar <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </article>
  );
};

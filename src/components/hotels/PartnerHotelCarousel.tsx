'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';
import { formatCurrency, formatDecimal } from '@/lib/formatters';
import { getLowestNightlyRate } from '@/data/hotels';
import { cn } from '@/lib/utils';
import type { HotelListing } from '@/types/booking';

const AUTOPLAY_MS = 5000;
const RESUME_AFTER_MS = 6000;

interface PartnerHotelCarouselProps {
  listings: HotelListing[];
  onSelect: (hotelId: string) => void;
}

export const PartnerHotelCarousel = ({ listings, onSelect }: PartnerHotelCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);

  activeIndexRef.current = activeIndex;

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
    const clamped = Math.min(listings.length - 1, Math.max(0, nextIndex));
    if (clamped !== activeIndexRef.current) {
      setActiveIndex(clamped);
    }
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    scrollToIndex(index);
  };

  useEffect(() => {
    if (paused || listings.length < 2) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const timer = window.setInterval(() => {
      const next = (activeIndexRef.current + 1) % listings.length;
      goToSlide(next);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [paused, listings.length]);

  useEffect(() => {
    if (!paused) {
      return;
    }
    const timer = window.setTimeout(() => setPaused(false), RESUME_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [paused]);

  if (listings.length === 0) {
    return null;
  }

  return (
    <section aria-label="Hotel mitra Alfa Teve" className="space-y-1.5">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="flex items-center gap-1 text-[13px] font-bold text-slate-900">
          Hotel Mitra Alfa Teve
        </h2>
        <span className="text-[10px] font-semibold text-slate-400">
          {listings.length} properti pilihan
        </span>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onPointerDown={() => setPaused(true)}
          onTouchStart={() => setPaused(true)}
          className="no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto rounded-2xl"
        >
          {listings.map(({ hotel }, index) => (
            <button
              key={hotel.id}
              type="button"
              onClick={() => onSelect(hotel.id)}
              aria-label={`Buka hotel mitra ${hotel.name}`}
              className="relative h-[140px] w-full shrink-0 snap-center overflow-hidden text-left"
            >
              <Image
                src={hotel.heroImage}
                alt={hotel.name}
                fill
                sizes="480px"
                priority={index === 0}
                className="object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                <span className="min-w-0">
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-400/95 px-1.5 py-0.5 text-[9px] font-bold text-amber-950">
                    <Star size={9} className="fill-amber-900 text-amber-900" />
                    {formatDecimal(hotel.rating)} · Bintang {hotel.starRating}
                  </span>
                  <span className="mt-1 block truncate text-[14px] font-bold leading-tight text-white">
                    {hotel.name}
                  </span>
                  <span className="block truncate text-[10px] text-white/75">
                    {hotel.city} · mulai {formatCurrency(getLowestNightlyRate(hotel.id))}/malam
                  </span>
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/95 text-primary">
                  <ArrowRight size={15} />
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-slate-900/40 px-1">
          {listings.map(({ hotel }, index) => (
            <button
              key={`dot-${hotel.id}`}
              type="button"
              onClick={() => {
                setPaused(true);
                goToSlide(index);
              }}
              aria-label={`Banner ${index + 1}`}
              aria-current={index === activeIndex}
              className="flex h-8 w-5 items-center justify-center"
            >
              <span
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  index === activeIndex ? 'w-3.5 bg-white' : 'w-1.5 bg-white/55'
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
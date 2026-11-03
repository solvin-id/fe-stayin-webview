'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HotelGroupWithHotels } from '@/types/booking';

const AUTOPLAY_MS = 5000;
const RESUME_AFTER_MS = 6000;

interface HotelGroupCarouselProps {
  groups: HotelGroupWithHotels[];
  onSelect: (groupId: string) => void;
}

export const HotelGroupCarousel = ({ groups, onSelect }: HotelGroupCarouselProps) => {
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

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    scrollToIndex(index);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
    const clamped = Math.min(groups.length - 1, Math.max(0, nextIndex));
    if (clamped !== activeIndexRef.current) {
      setActiveIndex(clamped);
    }
  };

  useEffect(() => {
    if (paused || groups.length < 2) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const timer = window.setInterval(() => {
      goToSlide((activeIndexRef.current + 1) % groups.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [paused, groups.length]);

  useEffect(() => {
    if (!paused) {
      return;
    }
    const timer = window.setTimeout(() => setPaused(false), RESUME_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [paused]);

  if (groups.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Rekomendasi Grup Hotel"
      className="space-y-2 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#05071C_0%,#141A33_42%,#3A2216_76%,#7A3517_100%)] p-2.5 shadow-lg shadow-slate-900/25"
    >
      <div className="flex items-center justify-between px-0.5">
        <h2 className="flex items-center gap-1.5 text-[14px] font-bold text-white">
          <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
          Rekomendasi Grup Hotel
        </h2>
        <span className="text-[10px] font-semibold text-white/45">
          {groups.length} grup terdaftar
        </span>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          onPointerDown={() => setPaused(true)}
          onTouchStart={() => setPaused(true)}
          className="no-scrollbar flex w-full snap-x snap-mandatory overflow-x-auto rounded-xl shadow-lg shadow-black/40 ring-1 ring-white/10"
        >
          {groups.map((group, index) => (
            <button
              key={group.id}
              type="button"
              onClick={() => onSelect(group.id)}
              aria-label={`Buka grup hotel ${group.name}`}
              className="relative h-[220px] w-full shrink-0 snap-center overflow-hidden text-left"
            >
              <Image
                src={group.heroImage}
                alt={group.name}
                fill
                sizes="480px"
                priority={index === 0}
                className="object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/55 to-transparent" />

              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5">
                <span className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                    <Building2 size={10} /> {group.hotels.length} hotel
                  </span>
                  <span className="mt-1.5 block truncate text-[17px] font-bold leading-tight text-white">
                    {group.name}
                  </span>
                  <span className="mt-0.5 block line-clamp-2 text-[11px] leading-snug text-white/80">
                    {group.tagline}
                  </span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm">
                  <ArrowRight size={17} />
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="absolute right-2.5 top-2.5 flex items-center gap-0.5 rounded-full bg-slate-900/45 px-1 backdrop-blur-sm">
          {groups.map((group, index) => (
            <button
              key={`dot-${group.id}`}
              type="button"
              onClick={() => {
                setPaused(true);
                goToSlide(index);
              }}
              aria-label={`Grup ${index + 1}`}
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
'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Images } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoomImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export const RoomImageCarousel = ({ images, alt, className }: RoomImageCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(Math.min(images.length - 1, Math.max(0, nextIndex)));
  };

  return (
    <div className={cn('relative overflow-hidden bg-slate-100', className)}>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex h-44 w-full snap-x snap-mandatory overflow-x-auto"
      >
        {images.map((src, index) => (
          <div key={src} className="relative h-44 w-full shrink-0 snap-center">
            <Image
              src={src}
              alt={`${alt} foto ${index + 1}`}
              fill
              sizes="480px"
              priority={index === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-between px-2.5">
        <div className="flex items-center gap-1">
          {images.map((src, index) => (
            <span
              key={`dot-${src}`}
              className={cn(
                'h-1.5 rounded-full bg-white/70 transition-all',
                index === activeIndex ? 'w-4 bg-white' : 'w-1.5'
              )}
            />
          ))}
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          <Images size={10} /> {activeIndex + 1}/{images.length}
        </span>
      </div>
    </div>
  );
};

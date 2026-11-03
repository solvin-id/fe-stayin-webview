'use client';

import Image from 'next/image';
import { ArrowLeft, Building2, CheckCircle2, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FacilityIcon } from '@/components/room/FacilityIcon';
import { getLowestNightlyRate } from '@/data/hotels';
import { formatCurrency, formatDecimal, formatReviewCount } from '@/lib/formatters';
import type { HotelGroupWithHotels } from '@/types/booking';

interface HotelGroupDetailProps {
  group: HotelGroupWithHotels;
  onBack: () => void;
  onSelectHotel: (hotelId: string) => void;
}

export const HotelGroupDetail = ({ group, onBack, onSelectHotel }: HotelGroupDetailProps) => (
  <div className="flex flex-1 flex-col bg-canvas">
    <div className="sticky top-0 z-30">
      <header className="relative bg-primary pt-[env(safe-area-inset-top,0px)] text-white">
        <div className="flex min-h-[56px] items-center gap-1 px-1.5 py-1.5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Kembali"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-white/15"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-bold leading-tight">{group.name}</h1>
            <p className="truncate text-[11px] leading-tight text-white/80">
              {group.hotels.length} hotel · sejak {group.established}
            </p>
          </div>
        </div>
      </header>
    </div>

    <div className="flex-1 space-y-2.5 px-3 pb-[calc(6rem+var(--host-bottom-offset,0px))] pt-2.5">
      <section className="relative h-40 overflow-hidden rounded-2xl">
        <Image
          src={group.heroImage}
          alt={group.name}
          fill
          sizes="480px"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-[15px] font-bold leading-tight text-white">{group.name}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-white/80">{group.tagline}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
        <h2 className="text-[14px] font-bold text-slate-900">Profil Grup</h2>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">{group.description}</p>

        <dl className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <dt className="text-slate-400">Berdiri</dt>
            <dd className="font-semibold text-slate-800">{group.established}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Kantor pusat</dt>
            <dd className="font-semibold text-slate-800">{group.headquarters}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-slate-400">Keunggulan</dt>
            <dd className="font-semibold text-slate-800">{group.highlight}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
        <h2 className="text-[14px] font-bold text-slate-900">Layanan Grup</h2>
        <p className="text-[11px] text-slate-500">Tersedia di seluruh properti grup ini</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {group.services.map((service) => (
            <li
              key={service}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-surface px-2 py-1 text-[11px] font-semibold text-primary-dark"
            >
              <CheckCircle2 size={11} /> {service}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="flex items-center gap-1 text-[14px] font-bold text-slate-900">
            <Building2 size={14} /> Hotel dalam Grup
          </h2>
          <span className="text-[10px] font-semibold text-slate-400">
            {group.hotels.length} properti
          </span>
        </div>

        {group.hotels.map((hotel) => (
          <article
            key={hotel.id}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card"
          >
            <div className="flex gap-2.5 p-3">
              <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                <Image src={hotel.heroImage} alt={hotel.name} fill sizes="96px" className="object-cover" />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[13px] font-bold text-slate-900">{hotel.name}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                  <MapPin size={9} className="shrink-0" />
                  <span className="truncate">
                    {hotel.address}, {hotel.city}
                  </span>
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                  <Star size={9} className="fill-amber-400 text-amber-400" />
                  {formatDecimal(hotel.rating)} · {formatReviewCount(hotel.reviewCount)} ulasan ·
                  Bintang {hotel.starRating}
                </p>
                <p className="mt-1 text-[12px] font-bold text-primary">
                  {formatCurrency(getLowestNightlyRate(hotel.id))}
                  <span className="text-[10px] font-medium text-slate-400"> /malam</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 px-3">
              {hotel.facilities.slice(0, 3).map((facility) => (
                <Badge key={facility.id} tone="neutral" className="text-[10px]">
                  <FacilityIcon id={facility.id} size={11} /> {facility.label}
                </Badge>
              ))}
            </div>

            <div className="p-3 pt-2.5">
              <Button
                variant="action"
                size="sm"
                fullWidth
                onClick={() => onSelectHotel(hotel.id)}
              >
                Lihat Kamar
              </Button>
            </div>
          </article>
        ))}
      </section>
    </div>
  </div>
);
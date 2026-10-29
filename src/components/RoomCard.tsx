'use client';

import { BedDouble, Maximize2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { RoomImageCarousel } from '@/components/room/RoomImageCarousel';
import { RoomPackageOption } from '@/components/room/RoomPackageOption';
import { FacilityIcon } from '@/components/room/FacilityIcon';
import type { Room } from '@/types/booking';

interface RoomCardProps {
  room: Room;
  highlightedPackageId?: string | null;
  onSelectPackage: (roomId: string, packageId: string) => void;
  onOpenDetail: () => void;
}

export const RoomCard = ({
  room,
  highlightedPackageId = null,
  onSelectPackage,
  onOpenDetail,
}: RoomCardProps) => (
  <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
    <button
      type="button"
      onClick={onOpenDetail}
      aria-label={`Lihat detail ${room.name}`}
      className="block w-full text-left"
    >
      <RoomImageCarousel images={room.images} alt={room.name} />
    </button>

    <div className="px-3.5 pb-1 pt-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-bold text-slate-900">{room.name}</h3>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">{room.tagline}</p>
        </div>
        <button
          type="button"
          onClick={onOpenDetail}
          className="flex min-h-[44px] shrink-0 items-center rounded-lg px-2 text-[11px] font-semibold text-primary active:bg-primary-surface"
        >
          Detail
        </button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Maximize2 size={13} className="text-slate-400" /> {room.sizeSqm} m²
        </span>
        <span className="inline-flex items-center gap-1">
          <BedDouble size={13} className="text-slate-400" /> {room.bedType}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users size={13} className="text-slate-400" /> Maks. {room.maxOccupancy} tamu
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {room.facilities.slice(0, 3).map((facility) => (
          <Badge key={facility.id} tone="neutral" className="text-[10px]">
            <FacilityIcon id={facility.id} size={11} /> {facility.label}
          </Badge>
        ))}
      </div>

      <div className="mt-2 divide-y divide-slate-100 border-t border-slate-100">
        {room.packages.map((roomPackage) => (
          <RoomPackageOption
            key={roomPackage.id}
            roomPackage={roomPackage}
            highlighted={highlightedPackageId === roomPackage.id}
            onSelect={() => onSelectPackage(room.id, roomPackage.id)}
          />
        ))}
      </div>
    </div>
  </article>
);

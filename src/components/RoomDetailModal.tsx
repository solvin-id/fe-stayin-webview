'use client';

import { BedDouble, Maximize2, Users } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { RoomImageCarousel } from '@/components/room/RoomImageCarousel';
import { RoomPolicies } from '@/components/room/RoomPolicies';
import { FacilityIcon } from '@/components/room/FacilityIcon';
import { PackageSelector } from '@/components/room/PackageSelector';
import { getPackageById, getRoomById } from '@/data/hotels';
import { diffInNights } from '@/lib/date';
import { formatCurrency } from '@/lib/formatters';
import { buildPriceSummary } from '@/lib/pricing';
import type { Hotel, Room, SearchQuery } from '@/types/booking';

interface RoomDetailModalProps {
  open: boolean;
  roomId: string | null;
  packageId: string | null;
  /** Room resolved by the caller (API mode or mock); falls back to mock lookup when absent. */
  room?: Room;
  hotel: Hotel;
  search: SearchQuery;
  onSelectPackage: (packageId: string) => void;
  onClose: () => void;
  onContinue: () => void;
}

export const RoomDetailModal = ({
  open,
  roomId,
  packageId,
  room: roomProp,
  hotel,
  search,
  onSelectPackage,
  onClose,
  onContinue,
}: RoomDetailModalProps) => {
  const room = roomProp ?? getRoomById(roomId);
  if (!room) {
    return null;
  }

  const nights = diffInNights(search.checkIn, search.checkOut);
  const activePackage = getPackageById(room, packageId) ?? room.packages[0];
  const pricing = buildPriceSummary(activePackage.pricePerNight, nights, search.rooms);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={room.name}
      subtitle={[room.sizeSqm > 0 ? `${room.sizeSqm} m²` : null, room.bedType ?? null, `maksimal ${room.maxOccupancy} tamu`].filter(Boolean).join(' · ')}
      footer={
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-slate-500">Total {nights} malam</p>
            <p className="truncate text-[16px] font-bold text-primary">
              {formatCurrency(pricing.total)}
            </p>
          </div>
          <Button variant="action" size="lg" onClick={onContinue} className="shrink-0">
            Lanjut ke Pemesanan
          </Button>
        </div>
      }
    >
      <RoomImageCarousel images={room.images} alt={room.name} className="rounded-xl" />

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-slate-600">
        {room.sizeSqm > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Maximize2 size={13} className="text-slate-400" /> {room.sizeSqm} m²
          </span>
        ) : null}
        {room.bedType ? (
          <span className="inline-flex items-center gap-1">
            <BedDouble size={13} className="text-slate-400" /> {room.bedType}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <Users size={13} className="text-slate-400" /> {room.maxOccupancy} tamu
        </span>
      </div>

      <section className="mt-3">
        <h4 className="text-[13px] font-bold text-slate-900">Fasilitas Kamar</h4>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {room.facilities.map((facility) => (
            <span
              key={facility.id}
              className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] font-medium text-slate-600"
            >
              <FacilityIcon id={facility.id} size={13} /> {facility.label}
            </span>
          ))}
        </div>
      </section>

      <PackageSelector
        packages={room.packages}
        activePackageId={activePackage.id}
        onSelect={onSelectPackage}
      />

      <div className="mt-3">
        <RoomPolicies
          checkInTime={hotel.checkInTime}
          checkOutTime={hotel.checkOutTime}
          roomPackage={activePackage}
        />
      </div>

      <p className="py-3 text-[11px] leading-relaxed text-slate-500">
        Harga belum termasuk pajak dan biaya layanan; rinciannya dihitung pada halaman
        pemesanan.
      </p>
    </BottomSheet>
  );
};

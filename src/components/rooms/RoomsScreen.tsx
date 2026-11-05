'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { SearchSummaryBar } from '@/components/search/SearchSummaryBar';
import { DateGuestPickerModal } from '@/components/DateGuestPickerModal';
import { RoomDetailModal } from '@/components/RoomDetailModal';
import { HotelInfoCard } from '@/components/rooms/HotelInfoCard';
import { RoomList, RoomListSkeleton } from '@/components/rooms/RoomList';
import { useBookingStore } from '@/stores/useBookingStore';
import { useCatalogStore } from '@/stores/useCatalogStore';
import { useHostContext } from '@/hooks/useHostContext';
import { useAvailability } from '@/hooks/useAvailability';
import { isNginepEnabled } from '@/lib/api/config';
import { getHotelById, getRoomsByHotel } from '@/data/hotels';

export const RoomsScreen = () => {
  const step = useBookingStore((state) => state.step);
  const search = useBookingStore((state) => state.search);
  const selectedHotelId = useBookingStore((state) => state.selectedHotelId);
  const selectedRoomId = useBookingStore((state) => state.selectedRoomId);
  const selectedPackageId = useBookingStore((state) => state.selectedPackageId);
  const setSearch = useBookingStore((state) => state.setSearch);
  const openRoomDetail = useBookingStore((state) => state.openRoomDetail);
  const closeRoomDetail = useBookingStore((state) => state.closeRoomDetail);
  const selectPackage = useBookingStore((state) => state.selectPackage);
  const goToStep = useBookingStore((state) => state.goToStep);
  const showToast = useBookingStore((state) => state.showToast);
  const { isAlfaTeve } = useHostContext();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiMode = isNginepEnabled();
  const availability = useAvailability(search);
  const catalogListings = useCatalogStore((state) => state.listings);

  const mockHotel = getHotelById(selectedHotelId);
  const hotel = apiMode
    ? catalogListings.find((listing) =>
        listing.rooms.some((room) => room.id === selectedHotelId)
      )?.hotel ?? catalogListings[0]?.hotel
    : mockHotel;
  const mockRooms = getRoomsByHotel(selectedHotelId);
  const rooms = apiMode ? availability.rooms : mockRooms;
  const roomsLoading = apiMode
    ? availability.status === 'idle' || availability.status === 'loading'
    : loading;

  useEffect(() => {
    if (apiMode) {
      setLoading(false);
      return;
    }
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, [apiMode]);

  if (!hotel) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm font-semibold text-slate-700">Hotel belum dipilih.</p>
        <button
          type="button"
          onClick={() => goToStep(1)}
          className="min-h-[44px] rounded-xl bg-primary px-4 text-sm font-bold text-white"
        >
          Kembali ke Daftar Hotel
        </button>
      </div>
    );
  }

  const handleShare = async () => {
    const shareData = {
      title: hotel.name,
      text: `Cek kamar di ${hotel.name}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      showToast('Tautan hotel disalin.', 'success');
    } catch {
      showToast('Fitur bagikan tidak tersedia di perangkat ini.', 'info');
    }
  };

  const handleOpenDetail = (roomId: string, packageId: string | null) => {
    const fallbackRoom = rooms.find((room) => room.id === roomId);
    if (!fallbackRoom) {
      return;
    }
    const activePackageId =
      packageId && fallbackRoom.packages.some((item) => item.id === packageId)
        ? packageId
        : fallbackRoom.packages[0].id;
    openRoomDetail(roomId, activePackageId);
  };

  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <div className="sticky top-0 z-30">
        <Header
          title={hotel.name}
          subtitle={`${hotel.city} · Hotel Bintang ${hotel.starRating}`}
          isAlfaTeve={isAlfaTeve}
          onBack={() => goToStep(1)}
          onShare={handleShare}
        />
        <SearchSummaryBar search={search} onOpen={() => setPickerOpen(true)} />
      </div>

      <div className="flex-1 space-y-2.5 px-3 pb-8 pt-2.5">
        <HotelInfoCard hotel={hotel} />

        <div className="flex items-center justify-between px-0.5 pt-1">
          <h2 className="text-[15px] font-bold text-slate-900">Pilih Tipe Kamar</h2>
          <span className="text-[11px] text-slate-500">{rooms.length} tipe tersedia</span>
        </div>

        {roomsLoading ? (
          <RoomListSkeleton />
        ) : apiMode && availability.status === 'error' ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-card">
            <p className="text-[13px] font-bold text-slate-900">Terjadi Kendala</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{availability.error}</p>
            <button
              type="button"
              onClick={availability.retry}
              className="mt-3 inline-flex min-h-[44px] items-center rounded-xl bg-primary px-5 text-[12px] font-bold text-white"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <RoomList
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            selectedPackageId={selectedPackageId}
            onSelectPackage={handleOpenDetail}
          />
        )}

        <p className="pb-2 pt-1 text-center text-[10px] leading-relaxed text-slate-400">
          Harga per malam sudah termasuk promo Alfa Teve.
          <br />
          Pajak & biaya layanan dihitung di halaman pemesanan.
        </p>
      </div>

      <DateGuestPickerModal
        open={pickerOpen}
        search={search}
        onClose={() => setPickerOpen(false)}
        onApply={(nextSearch) => {
          setSearch(nextSearch);
          showToast('Tanggal menginap diperbarui.', 'success');
        }}
      />

      <RoomDetailModal
        open={step === 3}
        roomId={selectedRoomId}
        packageId={selectedPackageId}
        room={rooms.find((item) => item.id === selectedRoomId)}
        hotel={hotel}
        search={search}
        onSelectPackage={selectPackage}
        onClose={closeRoomDetail}
        onContinue={() => goToStep(4)}
      />
    </div>
  );
};

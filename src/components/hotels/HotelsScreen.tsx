'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { SearchSummaryBar } from '@/components/search/SearchSummaryBar';
import { HotelSearchBar } from '@/components/search/HotelSearchBar';
import { DateGuestPickerModal } from '@/components/DateGuestPickerModal';
import { HotelList, HotelListSkeleton } from '@/components/hotels/HotelList';
import { HotelFilterButton } from '@/components/hotels/HotelFilterButton';
import { PartnerHotelCarousel } from '@/components/hotels/PartnerHotelCarousel';
import { CityFilterSheet } from '@/components/hotels/CityFilterSheet';
import { useBookingStore } from '@/stores/useBookingStore';
import { useHostContext } from '@/hooks/useHostContext';
import { closeWebview } from '@/services/bridge.service';
import { HOTELS, getAlfaTevePartnerHotels } from '@/data/hotels';
import { buildCityOptions, filterHotels } from '@/lib/hotelFilter';

export const HotelsScreen = () => {
  const search = useBookingStore((state) => state.search);
  const hotelQuery = useBookingStore((state) => state.hotelQuery);
  const cityFilter = useBookingStore((state) => state.cityFilter);
  const setSearch = useBookingStore((state) => state.setSearch);
  const setHotelQuery = useBookingStore((state) => state.setHotelQuery);
  const setCityFilter = useBookingStore((state) => state.setCityFilter);
  const resetHotelFilters = useBookingStore((state) => state.resetHotelFilters);
  const selectHotel = useBookingStore((state) => state.selectHotel);
  const showToast = useBookingStore((state) => state.showToast);
  const { isAlfaTeve } = useHostContext();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const cityOptions = useMemo(() => buildCityOptions(HOTELS), []);
  const partnerHotels = useMemo(() => getAlfaTevePartnerHotels(), []);
  const listings = useMemo(
    () => filterHotels(HOTELS, hotelQuery, cityFilter),
    [hotelQuery, cityFilter]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timer);
  }, []);

  const handleBack = () => {
    const target = closeWebview();
    showToast(
      target === 'browser'
        ? 'Pratinjau browser: event close_webview dikirim ke parent.'
        : 'Menutup Stayin, kembali ke Alfa Teve.',
      'info'
    );
  };

  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <div className="sticky top-0 z-30">
        <Header
          title="Stayin"
          subtitle="Temukan hotel untuk menginap"
          isAlfaTeve={isAlfaTeve}
          onBack={handleBack}
        />
        <HotelSearchBar value={hotelQuery} onChange={setHotelQuery} />
        <SearchSummaryBar search={search} onOpen={() => setPickerOpen(true)} />
      </div>

      <div className="flex-1 space-y-2.5 px-3 pb-[calc(6rem+var(--host-bottom-offset,0px))] pt-2.5">
        <PartnerHotelCarousel listings={partnerHotels} onSelect={selectHotel} />

        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[15px] font-bold text-slate-900">
            {cityFilter ? `Hotel di ${cityFilter}` : 'Rekomendasi Hotel'}
          </h2>
          <span className="text-[11px] text-slate-500">{listings.length} hotel tersedia</span>
        </div>

        {loading ? (
          <HotelListSkeleton />
        ) : (
          <HotelList
            listings={listings}
            onSelectHotel={selectHotel}
            onReset={resetHotelFilters}
          />
        )}

        <p className="pb-2 pt-1 text-center text-[10px] leading-relaxed text-slate-400">
          Harga per malam sudah termasuk promo Alfa Teve.
          <br />
          Pilih hotel untuk melihat tipe kamar yang tersedia.
        </p>
      </div>

      <HotelFilterButton activeCity={cityFilter} onClick={() => setFilterOpen(true)} />

      <DateGuestPickerModal
        open={pickerOpen}
        search={search}
        onClose={() => setPickerOpen(false)}
        onApply={(nextSearch) => {
          setSearch(nextSearch);
          showToast('Tanggal menginap diperbarui.', 'success');
        }}
      />

      <CityFilterSheet
        open={filterOpen}
        cities={cityOptions}
        selected={cityFilter}
        onClose={() => setFilterOpen(false)}
        onApply={(city) => {
          setCityFilter(city);
          setFilterOpen(false);
          showToast(
            city ? `Menampilkan hotel di ${city}.` : 'Menampilkan semua kota.',
            'success'
          );
        }}
      />
    </div>
  );
};

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { SearchSummaryBar } from '@/components/search/SearchSummaryBar';
import { HotelSearchBar } from '@/components/search/HotelSearchBar';
import { DateGuestPickerModal } from '@/components/DateGuestPickerModal';
import { HotelList, HotelListSkeleton } from '@/components/hotels/HotelList';
import { HotelFilterButton } from '@/components/hotels/HotelFilterButton';
import { HotelGroupCarousel } from '@/components/hotels/HotelGroupCarousel';
import { CityFilterSheet } from '@/components/hotels/CityFilterSheet';
import { useBookingStore } from '@/stores/useBookingStore';
import { useCatalogStore } from '@/stores/useCatalogStore';
import { useHostContext } from '@/hooks/useHostContext';
import { closeWebview } from '@/services/bridge.service';
import { isNginepEnabled } from '@/lib/api/config';
import { HOTELS } from '@/data/hotels';
import { getHotelGroups } from '@/data/hotelGroups';
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
  const openGroup = useBookingStore((state) => state.openGroup);
  const showToast = useBookingStore((state) => state.showToast);
  const { tenantId, isAlfaTeve } = useHostContext();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiMode = isNginepEnabled();
  const catalogListings = useCatalogStore((state) => state.listings);
  const catalogStatus = useCatalogStore((state) => state.status);
  const catalogError = useCatalogStore((state) => state.error);
  const loadCatalog = useCatalogStore((state) => state.load);

  useEffect(() => {
    let cancelled = false;
    // Load in BOTH modes: in API mode it fetches the profile, in mock mode it
    // seeds HOTELS — startPayment resolves rooms through this store either way.
    setLoading(true);
    void loadCatalog(tenantId).finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiMode, tenantId]);

  const mockCityOptions = useMemo(() => buildCityOptions(HOTELS), []);
  const partnerHotels = useMemo(() => getHotelGroups(), []);

  const sourceListings = apiMode ? catalogListings : HOTELS;
  const listings = useMemo(
    () => filterHotels(sourceListings, hotelQuery, cityFilter),
    [sourceListings, hotelQuery, cityFilter]
  );
  const cityOptions = apiMode ? buildCityOptions(catalogListings) : mockCityOptions;

  const handleBack = () => {
    const target = closeWebview();
    showToast(
      target === 'browser'
        ? 'Pratinjau browser: event close_webview dikirim ke parent.'
        : 'Menutup Stayin, kembali ke Alfa Teve.',
      'info'
    );
  };

  const handleRetry = () => {
    void loadCatalog(tenantId);
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
        {!apiMode ? <HotelGroupCarousel groups={partnerHotels} onSelect={openGroup} /> : null}

        <div className="flex items-center gap-2 px-0.5 pb-1 pt-4">
          <h2 className="text-[15px] font-bold text-slate-900">
            {cityFilter ? `Hotel di ${cityFilter}` : 'Rekomendasi Hotel'}
          </h2>
          <span className="text-[11px] text-slate-500">{listings.length} hotel tersedia</span>
          <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
        </div>

        {loading ? (
          <HotelListSkeleton />
        ) : apiMode && catalogStatus === 'error' ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-card">
            <p className="text-[13px] font-bold text-slate-900">Terjadi Kendala</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{catalogError}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-3 inline-flex min-h-[44px] items-center rounded-xl bg-primary px-5 text-[12px] font-bold text-white"
            >
              Coba Lagi
            </button>
          </div>
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

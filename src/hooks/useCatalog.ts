'use client';

import { useCallback } from 'react';
import { useCatalogStore, type CatalogStatus } from '@/stores/useCatalogStore';
import type { HotelListing } from '@/types/booking';

interface UseCatalogResult {
  listings: HotelListing[];
  status: CatalogStatus;
  error: string | null;
  isLoading: boolean;
  load: (tenantId: string | null) => Promise<void>;
  reload: (tenantId: string | null) => Promise<void>;
  clear: () => void;
}

export const useCatalog = (): UseCatalogResult => {
  const listings = useCatalogStore((state) => state.listings);
  const status = useCatalogStore((state) => state.status);
  const error = useCatalogStore((state) => state.error);
  const load = useCatalogStore((state) => state.load);
  const clear = useCatalogStore((state) => state.clear);

  const reload = useCallback(
    (tenantId: string | null) => useCatalogStore.getState().load(tenantId),
    []
  );

  return {
    listings,
    status,
    error,
    isLoading: status === 'idle' || status === 'loading',
    load,
    reload,
    clear,
  };
};

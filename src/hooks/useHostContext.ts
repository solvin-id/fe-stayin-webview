'use client';

import { useEffect, useState } from 'react';

export interface HostContext {
  token: string | null;
  tenantId: string | null;
  source: string | null;
  isAlfaTeve: boolean;
  isEmbedded: boolean;
}

const EMPTY_CONTEXT: HostContext = {
  token: null,
  tenantId: null,
  source: null,
  isAlfaTeve: false,
  isEmbedded: false,
};

const HOST_TOKEN_STORAGE_KEY = 'nginep_host_token';
const TENANT_STORAGE_KEY = 'nginep_tenant';

export const useHostContext = (): HostContext => {
  const [context, setContext] = useState<HostContext>(EMPTY_CONTEXT);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const tenantId = params.get('tenant_id');
    const source = params.get('source');

    try {
      if (token) {
        window.sessionStorage.setItem(HOST_TOKEN_STORAGE_KEY, token);
      } else {
        window.sessionStorage.removeItem(HOST_TOKEN_STORAGE_KEY);
      }
      if (tenantId) {
        window.sessionStorage.setItem(TENANT_STORAGE_KEY, tenantId);
      } else {
        window.sessionStorage.removeItem(TENANT_STORAGE_KEY);
      }
    } catch {
      // sessionStorage unavailable (private mode / storage disabled): state still works.
    }

    setContext({
      token,
      tenantId,
      source,
      isAlfaTeve: source === 'alfateve' || Boolean(token && tenantId),
      isEmbedded: window.parent !== window,
    });
  }, []);

  return context;
};

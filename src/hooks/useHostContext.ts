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

export const useHostContext = (): HostContext => {
  const [context, setContext] = useState<HostContext>(EMPTY_CONTEXT);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const tenantId = params.get('tenant_id');
    const source = params.get('source');

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

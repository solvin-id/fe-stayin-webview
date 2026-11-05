import { BFF_BASE, isNginepEnabled, TENANT_HEADER } from './config';
import { NginepApiError } from './errors';

export interface INnginepRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  tenant?: string;
  idempotencyKey?: string;
  signal?: AbortSignal;
}

const normalizeTenant = (tenant?: string): string | null => {
  if (tenant && tenant.trim().length > 0) {
    return tenant.trim();
  }
  if (typeof window !== 'undefined') {
    const fromStorage = window.sessionStorage.getItem('nginep_tenant');
    if (fromStorage && fromStorage.trim().length > 0) {
      return fromStorage.trim();
    }
  }
  return null;
};

/**
 * Calls the Next.js BFF proxy (`/api/nginep/...`). Throws `NginepApiError` on
 * any non-2xx response, including the proxy's own TENANT_MISSING and
 * UPSTREAM_UNREACHABLE codes.
 */
export const nginepFetch = async <T>(
  path: string,
  options: INnginepRequestOptions = {},
): Promise<T> => {
  if (!isNginepEnabled()) {
    throw new Error('Nginep integration is disabled');
  }
  const tenant = normalizeTenant(options.tenant);
  if (!tenant) {
    throw new NginepApiError(400, { code: 'TENANT_MISSING' });
  }
  const headers: Record<string, string> = {
    [TENANT_HEADER]: tenant,
  };
  if (options.body !== undefined) {
    headers['content-type'] = 'application/json';
  }
  if (options.idempotencyKey) {
    headers['idempotency-key'] = options.idempotencyKey;
  }
  const response = await fetch(`${BFF_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });
  const text = await response.text();
  const parsed: unknown = text.length > 0 ? JSON.parse(text) : {};
  if (!response.ok) {
    const body =
      typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : { message: text };
    throw new NginepApiError(response.status, body);
  }
  return parsed as T;
};

/**
 * Nginep integration configuration. When `NEXT_PUBLIC_NGINEP_API_URL` is unset
 * the webview runs in mock mode against local demo data.
 */
export const NGINEP_API_URL =
  process.env.NEXT_PUBLIC_NGINEP_API_URL?.replace(/\/+$/, '') ?? '';

export const isNginepEnabled = (): boolean => NGINEP_API_URL.length > 0;

export const TENANT_HEADER = 'x-nginep-tenant';

/**
 * Fallback tenant subdomain for local development, read at module load. The
 * BFF still requires a real tenant via header/query/cookie in production.
 */
export const DEFAULT_TENANT =
  process.env.NEXT_PUBLIC_NGINEP_TENANT ?? '';

/** BFF route every browser request goes through. */
export const BFF_BASE = '/api/nginep';

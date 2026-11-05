/**
 * Nginep integration configuration.
 *
 * The browser only ever calls the same-origin BFF (`/api/nginep/*`), so the
 * public URL is informational; mode selection uses an explicit flag that CI
 * sets at build time. `NEXT_PUBLIC_NGINEP_ENABLED=false` forces mock mode, and
 * an explicit URL keeps older builds working.
 */
export const NGINEP_API_URL =
  process.env.NEXT_PUBLIC_NGINEP_API_URL?.replace(/\/+$/, '') ?? '';

const ENABLED_FLAG = process.env.NEXT_PUBLIC_NGINEP_ENABLED;

export const isNginepEnabled = (): boolean =>
  ENABLED_FLAG === 'true' ||
  (ENABLED_FLAG !== 'false' && NGINEP_API_URL.length > 0);

export const TENANT_HEADER = 'x-nginep-tenant';

/**
 * Fallback tenant subdomain for local development, read at module load. The
 * BFF still requires a real tenant via header/query/cookie in production.
 */
export const DEFAULT_TENANT =
  process.env.NEXT_PUBLIC_NGINEP_TENANT ?? '';

/** BFF route every browser request goes through. */
export const BFF_BASE = '/api/nginep';

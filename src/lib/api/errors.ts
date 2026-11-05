/** Machine-readable error codes surfaced by the BFF proxy. */
export const TENANT_MISSING = 'TENANT_MISSING';
export const UPSTREAM_UNREACHABLE = 'UPSTREAM_UNREACHABLE';

/** Error shape the API returns; `message` is human-readable, `code` is stable. */
export interface INnginepErrorBody {
  code?: string;
  message?: string;
  [key: string]: unknown;
}

/** Typed error carrying the upstream HTTP status and payload. */
export class NginepApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly body: INnginepErrorBody;

  constructor(status: number, body: INnginepErrorBody) {
    super(body.message ?? `Nginep API error ${status}`);
    this.name = 'NginepApiError';
    this.status = status;
    this.code = typeof body.code === 'string' ? body.code : `HTTP_${status}`;
    this.body = body;
  }

  get isTenantMissing(): boolean {
    return this.status === 400 && this.code === TENANT_MISSING;
  }

  get isUpstreamUnreachable(): boolean {
    return this.code === UPSTREAM_UNREACHABLE;
  }
}

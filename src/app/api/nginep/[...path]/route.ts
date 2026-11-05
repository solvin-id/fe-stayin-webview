import { type NextRequest, NextResponse } from 'next/server';

type IParams = { params: Promise<{ path: string[] }> };

const TENANT_HEADER = 'x-nginep-tenant';
const TENANT_COOKIE = 'nginep_tenant';
/** Only these upstream namespaces are reachable from the webview. */
const ALLOWED_ROOTS: Record<string, true> = {
  storefront: true,
  availability: true,
  booking: true,
  payment: true,
};
const FORWARDED_HEADERS = [
  'authorization',
  'content-type',
  'idempotency-key',
  TENANT_HEADER,
] as const;

const upstreamUrl = (): string =>
  (process.env.NGINEP_API_URL ?? process.env.NEXT_PUBLIC_NGINEP_API_URL ?? '').replace(
    /\/+$/,
    '',
  );

const resolveTenant = (request: NextRequest): string | null => {
  const header = request.headers.get(TENANT_HEADER);
  if (header && header.trim().length > 0) {
    return header.trim();
  }
  const query = new URL(request.url).searchParams.get('tenant_id');
  if (query && query.trim().length > 0) {
    return query.trim();
  }
  const cookie = request.cookies.get(TENANT_COOKIE)?.value;
  if (cookie && cookie.trim().length > 0) {
    return cookie.trim();
  }
  return null;
};

const readBody = async (
  request: NextRequest,
): Promise<BodyInit | undefined> => {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return undefined;
  }
  const text = await request.text();
  return text.length > 0 ? text : undefined;
};

const pickHeaders = (
  request: NextRequest,
  tenant: string,
): Record<string, string> => {
  const headers: Record<string, string> = {
    [TENANT_HEADER]: tenant,
  };
  for (const name of FORWARDED_HEADERS) {
    if (name === TENANT_HEADER) {
      continue;
    }
    const value = request.headers.get(name);
    if (value) {
      headers[name] = value;
    }
  }
  return headers;
};

const respond = async (
  request: NextRequest,
  context: IParams,
): Promise<NextResponse> => {
  const { path } = await context.params;
  const base = upstreamUrl();
  if (base.length === 0) {
    return NextResponse.json(
      { code: 'UPSTREAM_UNREACHABLE' },
      { status: 502 },
    );
  }
  const tenant = resolveTenant(request);
  if (!tenant) {
    return NextResponse.json({ code: 'TENANT_MISSING' }, { status: 400 });
  }
  const incoming = new URL(request.url);
  const segments = path.map((segment) => decodeURIComponent(segment));
  if (
    segments.length === 0 ||
    !ALLOWED_ROOTS[segments[0]] ||
    segments.some((segment) => segment === '.' || segment === '..' || segment.includes('/'))
  ) {
    return NextResponse.json({ code: 'PATH_FORBIDDEN' }, { status: 404 });
  }
  const outgoing = new URL(
    `/api/${segments.join('/')}${incoming.search}`,
    `${base}/`,
  );
  outgoing.searchParams.delete('tenant_id');
  try {
    const upstream = await fetch(outgoing.toString(), {
      method: request.method,
      headers: pickHeaders(request, tenant),
      body: await readBody(request),
      cache: 'no-store',
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  } catch {
    return NextResponse.json(
      { code: 'UPSTREAM_UNREACHABLE' },
      { status: 502 },
    );
  }
};

export const GET = (request: NextRequest, context: IParams) =>
  respond(request, context);

export const POST = (request: NextRequest, context: IParams) =>
  respond(request, context);

export const PATCH = (request: NextRequest, context: IParams) =>
  respond(request, context);

export const DELETE = (request: NextRequest, context: IParams) =>
  respond(request, context);

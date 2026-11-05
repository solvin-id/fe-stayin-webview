# Integrasi Tenant API — Stayin WebView

> **Status:** Draft untuk implementasi BFF proxy di `src/app/api/**` + mappers di `src/services/*`.  
> Tenant: `@nginep/api` (NestJS, RLS per-tenant), Gateway: `apps/web/gw/[...path]/route.ts`, Webview target: `tenant/fe-stayin-webview`.  
> **Kontrak inti:** header `x-nginep-tenant` dari host (`?tenant_id=`), auth via token/host context, fallback mock saat URL kosong.

---

## Ringkasan Arsitektur

| Layer | Lokasi | Peran |
| --- | --- | --- |
| **Tenant API** | `code/apps/api` | Data core: rooms, availability, inventory, bookings, payments, promos, settings |
| **Gateway (BFF referensi)** | `code/apps/web/app/gw/[...path]/route.ts` | Proxy Next.js yang meneruskan header + auth upstream; pattern yang akan ditiru di webview |
| **WebView App** | `tenant/fe-stayin-webview` | React client (Next.js 15); BFF route handlers di `/api/*` + mapper services |
| **Host Bridge** | `useHostContext()` | Extract `token`, `tenant_id` via URL params → cookie/session untuk gateway |

**Prinsip utama:**
1. Tidak ada fetch langsung browser→API dari webview UI. Semua via `/api/*` BFF (avoids CORS, centralizes tenant header).
2. Tipe internal webview tidak berubah; semua transformasi DTO dilakukan di mappers (`src/services/*`).
3. Fallback mock tetap aktif bila `NEXT_PUBLIC_NGINEP_API_URL` tidak diset, agar test/UI lama stabil.
4. Tenant resolution via `?tenant_id=` dari host → diteruskan ke API sebagai `X-Nginep-Tenant`; tanpa tenant = 400.

---

## Mapping Kebutuhan Data ↔ Endpoint API

### 🔥 Priority 1 — Katalog & Hotel Info (Public read-only, cross-tenant)

**Kebutuhan webview:**
- `HOTELS` listing (hotel + rooms + packages) dengan kota, bintang, rating, fasilitas
- Hotel group (carousel partner hotel): nama, tagline, deskripsi, hotelIds, hero images
- City filter options

**Gap besar:** API tidak memiliki endpoint publik untuk katalog hotel lengkap (nama, address, starRating, city, facilities, description, images).  
**Room & RoomPackage** tersedia via `GET /catalog/rooms` tetapi:
- Hanya field dasar room (`id`, `name`, `capacity`, `basePrice`, `active`)
- Tidak ada `Facility[]`, `images[]`, `packages[]`, `tagline`, `sizeSqm`, `bedType`
- Hotel metadata (heroImage, address, phone, mapsUrl, distanceToCenter) tidak ada

**Rencana action:**
1. Buat endpoint baru **hanya tenant owners dapat melihat room details**, atau gunakan current `getRoom(id)` jika cukup minimal (untuk MVP).
2. Untuk katalog publik, kita **tidak bisa exposing semua hotel** kecuali:
   - Tenant config punya `publicProfile` json (add column `publicProfile` to Tenant model), atau
   - Seeder membuat dummy catalog records dengan flag `isPublic=true`

**Rekomendasi arsitektural:** Tambahkan **seeded demo data untuk "Grand Dian"** sebagai single public hotel untuk testing, dengan rooms & amenities lengkap, lalu expose via `GET /catalog/public/hotels/:subdomain`.

**Mapping sementara (fallback):**
| Webview export | Tenant API | Auth | Notes |
| --- | --- | --- | --- |
| `HOTELS` | ❌ Tidak ada | N/A | **GAP**: perlu seed/demo public hotel |
| `getRoomsByHotel(hotelId)` | `GET /catalog/rooms` | `X-Nginep-Tenant` | Butuh filter by tenant & room ID |
| `getLowestNightlyRate` | ❌ Harus computed dari inventory | `X-Nginep-Tenant` | Service layer perlu cache inventory rates |

---

### 🔥 Priority 2 — Availability Search (Guest-facing)

**Kebutuhan webview:**
- Search rooms with dates, guests from `DEFAULT_SEARCH`: `{checkIn, checkOut, guests}`
- Return list of rooms with price per night, stock, total

**Endpoint API:** `POST /api/availability` (body: `checkIn, checkOut, guests`) — **no `/search` suffix**.
- Guard: `@TenantScoped()` only (`availability.controller.ts:29-45`) — **no JWT/Roles; guest-accessible** with just the `x-nginep-tenant` header.
- Rejects past check-in, checkOut <= checkIn; skips rooms with blackout/CTA/CTD/minStay violations.
- Response: `IRoomOffer[]` → room + nightly prices + stock + total

**Mapping to webview:**
| Webview call | Tenant API | Transformations |
| --- | --- | --- |
| `getRoomsByHotel()` + date filter | `POST /api/availability` (guest-accessible, tenant header only) | Filter rooms by hotelId locally; compute lowest rate; add package mock (need enhancement) |
| Price summary (`buildPriceSummary`) | `computePricing()` in `availability.service.ts` | Service must use same tax/service pct from tenant config |

**Auth needed:** Tenant resolution via `x-nginep-tenant` header (from host) + optionally API key scope.

---

### 🔥 Priority 3 — Booking Creation (Guest write)

**Kebutuhan webview:**
- Create booking via `useBookingStore.startPayment()`: store reference, payment status, guest details
- Body: `{ checkIn, checkOut, guests, roomId, guestName, email, phone, channel='web', promoCode? }`
- Idempotency key needed

**Endpoint API:** `POST /api/booking`
- Guard: `OptionalApiKeyAuthGuard` + `ScopesGuard` with `'booking:write'`
- Accepts: `IBookingInput` (validated), `clientKey` from `idempotency-key` header
- Returns: `IBookingCreateResult` with `booking.code` as reference, `paymentToken` null

**Mapping to webview:**
| Webview flow | Tenant API | Notes |
| --- | --- | --- |
| `startPayment()` creates local booking | `POST /api/booking` | Replace local generation with server reference (`booking.code`) |
| `confirmPayment()` changes status | ❌ `POST /api/booking/:id/confirm` requires bot key (`ngk_`) or staff JWT — **guests cannot call it**. Webview must poll status instead; only the Midtrans webhook advances payment. |
| Payment status polling | ❌ No public endpoint exists (see gap below) | Guest flow needs a public booking-status-by-code route |

**Auth needed:** API Key (`ngk_…`) for machine-to-machine OR human session (JWT). For guest flows, use optional API key or allow anonymous.

---

### 🔥 Priority 4 — Payments

**Kebutuhan webview:**
- Snap token generation for Midtrans
- Status checks, countdown timer until expiry

**Endpoint API:** `POST /api/payment/snap`
- Guard: `TenantScoped()`
- Body: `{ bookingId }`
- Returns: `{ snapToken }`

**Mapping:**
| Webview need | Tenant API | Notes |
| --- | --- | --- |
| Generate snap token | `POST /api/payment/snap` | Map booking reference to DB booking ID (via code lookup if needed) |
| Confirm payment | `POST /api/booking/:bookingId/confirm` | After webhook, update status in backend |
| Payment expiry timer | Stored in booking `holdExpiresAt` field | Need read endpoint if not stored in store |

---

### 🔥 Priority 5 — Member Session/Auth

**Kebutuhan webview:**
- `useHostContext()` reads `token`, `tenant_id`, `source` from URL
- `useSessionStore` stores member profile

**Endpoint API:** `POST /auth/login` (email/password), `GET /auth/my-tenants`
- Returns JWT token; tenant resolved via JWT claim `tenantId`

**Mapping:**
| Webview current | Tenant API option | Action |
| --- | --- | --- |
| Mock session/localStorage | `POST /auth/login` → JWT | Implement real login, store token in sessionStorage |
| Token from host URL param | Use `token` param → forward as Authorization | Add BFF route that accepts token param securely |

---

## Tenant Resolution & Header Pattern

From `apps/web` implementation:
- Subdomain parsing: `browserTenantSubdomain()` from hostname
- Path parsing: `tenantFromPath(pathname)` for path-based routing
- Header constant: `TENANT_HEADER = 'x-nginep-tenant'`
- Gateway forwards this header + selected auth headers

**For webview BFF:**
1. Accept `tenant_id` from URL params (`?tenant_id=grand-dian`)
2. Or derive from host app cookie (e.g., `nginep_tenant`)
3. Set header `x-nginep-tenant` on all upstream requests
4. If missing, return 400 with message `TENANT_MISSING`

---

## Type Contracts (Webview ↔ API)

### Webview Types (`src/types/booking.ts`)

```typescript
interface Facility { id: string; label: string }
interface RoomPackage { 
  id: string; name: string; mealPlan: 'ROOM_ONLY'|'BREAKFAST';
  includesBreakfast: boolean; cancellationPolicy: string;
  pricePerNight: number; originalPricePerNight?: number;
}
interface Room {
  id: string; name: string; tagline: string; sizeSqm: number;
  bedType: string; maxOccupancy: number; images: string[];
  facilities: Facility[]; packages: RoomPackage[];
}
interface Hotel {
  id: string; name: string; address: string; city: string;
  starRating: number; rating: number; reviewCount: number;
  checkInTime: string; checkOutTime: string; distanceToCenter: string;
  phone: string; mapsUrl: string; heroImage: string;
  facilities: Facility[];
}
interface Booking {
  reference: string; hotel: Hotel; roomId: string; roomName: string;
  packageId: string; packageName: string; includesBreakfast: boolean;
  search: SearchQuery; nights: number; guest: GuestDetails;
  pricing: PriceSummary; method: PaymentMethodId; createdAt: string;
}
```

### API Types (`apps/api/src`)

```typescript
// Room
interface Room {
  id: string; tenantId: string; name: string; capacity: number;
  basePrice: string; active: boolean; amenities: unknown; facilities: unknown; images: unknown;
}

// IRoomOffer (search result)
interface IRoomOffer {
  room: Room; pricePerNight: {date: string; price: string}[]; total: string; stock: number;
}

// IBookingInput (create)
interface IBookingInput {
  checkIn: string; checkOut: string; guests: number; roomId: string;
  guestName: string; guestEmail: string|null; guestPhone?: string;
  channel: string; holdTtlMinutes: number; quoteToken?: string; promoCode?: string;
}

// ISnapResponse
interface ISnapResponse { snapToken: string; }
```

**Mapper responsibility:** Convert snake_case/API types → camelCase/Webview types, handle Decimal→number, transform fields absent in API or add mocks/computed values.

---

## Implementation Steps

### Phase A — Foundation (contract, client, proxy)

1. **Config & Env:** `.env.example`, `src/lib/api/config.ts`, `src/types/api.ts`
2. **BFF Gateway Routes:** `src/app/api/*/route.ts` following `apps/web/gw` pattern
3. **API Client:** Fetch wrapper with auth + tenant header forwarding
4. **Tenant resolver middleware:** extract `tenant_id` from query/body/header → set upstream header

### Phase B — Data Mappers

5. **Hotel mapper:** Transform API room + inventory → webview `Hotel/Room` shape
6. **Availability mapper:** `IRoomOffer[]` → webview room list with packages
7. **Booking mapper:** `IBookingCreateResult` → webview `Booking` with server reference
8. **Payment mapper:** Snap response → payment info state

### Phase C — UI Wiring

9. **Hotels screen:** Fetch catalog or fallback mock
10. **Rooms screen:** Availability search results display
11. **Checkout section:** Form submit → create booking
12. **Payment section:** Snap token fetch, Midtrans script, status polling
13. **Voucher section:** E-voucher download/print (unchanged logic, new booking reference)

---

## Testing Strategy

- Unit tests remain 100% passing (mock fallback when env unset)
- Integration smoke tests against stubbed API (`http://localhost:4100`)
- Type checking: `npx tsc --noEmit` must pass
- Build: `npm run build` successful in CI

---

## Security Considerations

- All API calls via BFF only — no direct browser→API
- Host token (`?token=`) → stored in `sessionStorage` → forwarded as `Authorization` header
- Tenant resolution mandatory: 400 if missing, never default to mock silently
- Rate limiting / rate plan enforcement at API level (future)

---

## File Ownership Matrix (anti-bentrok)

| Owner | Directory / Files | Scope |
| --- | --- | --- |
| **Parent** | `src/types/*.ts`, contract docs | Interface boundaries, type evolution |
| **Contract** | `src/lib/api/*`, `src/app/api/*`, `src/services/*.service.ts` | BFF layer, client, DTO mappers |
| **Catalog** | `src/data/*.ts` (read), `src/components/hotels/*`, `src/components/room/*`, `src/app/page.tsx` | Catalog & room screens, filters |
| **Booking** | `src/stores/useBookingStore.ts`, `src/app/booking/*`, `src/components/checkout/*`, `src/components/payment/*` | Store logic, checkout form, payment |

---

## Gap Analysis Summary

| Area | Status | Risk | Plan |
| --- | --- | --- | --- |
| **Public hotel catalog** | ❌ Missing | High | Seed public hotel profile; add `GET /catalog/public/{subdomain}` or extend `/api/tenant` response |
| **Room packages** | Partial (base price only) | Medium | Seeded promo/discounts via Promo table; package names from rate plan; mapper derives mealPlan/cancellation |
| **Lowest nightly rate** | Computed | Low | Cache inventory prices; expose via mapped offer.total from availability search |
| **Availability search** | ✅ Present | Low | Route via BFF, tenant header → `POST /api/availability` |
| **Booking creation** | ✅ Present | Low | Guest-facing route with optional API key; map response |
| **Payment snap** | ✅ Present | Low | Route via BFF with correct tenant scope; handle snapToken redirect |
| **Member auth** | Partial (login exists) | Medium | Implement token exchange flow from host; no member profile store yet |
| **Guest booking status lookup** | ❌ Missing | Critical | Add `GET /api/public/bookings/:code?phone=` for guest polling after payment |
| **Public hotel profile** | Partial (name/subdomain/timezone) | Medium | Extend `/api/tenant` response OR new `GET /api/public/hotel-profile` with config-derived fields |

---

## New Public Endpoints Needed in Tenant API

To fully support the webview guest flow, add these tenant-scoped, read-only endpoints:

### `GET /api/public/hotel-profile` (TenantScoped, no auth)
Returns the current tenant's public-facing hotel identity derived from `tenants.config` + room metadata:

```json
{
  "hotel": {
    "id": "string",
    "name": "Grand Dian Hotel & Resort",
    "subdomain": "grand-dian",
    "address": "Jl. Danau Toba No. 45, Sanur, Denpasar, Bali",
    "city": "Denpasar", // parseable from address, or explicit config.public_profile.city
    "phone": "+62 361 889900",
    "email": "reservation@granddianhotel.com",
    "checkInTime": "14:00",
    "checkOutTime": "12:00",
    "taxRate": 0.1,
    "currency": "IDR",
    "serviceFeeRate": 0.05,
    "starRating": 0, // fallback if not set; UI should hide/show based on presence
    "rating": 0,
    "reviewCount": 0,
    "distanceToCenter": "—",
    "heroImage": "https://...", // from first active room's images[0]
    "mapsUrl": "https://maps.google.com/?q=..."
  },
  "rooms": [
    {
      "id": "string",
      "name": "Superior Double",
      "description": "Kamar modern dengan fasilitas lengkap",
      "capacity": 2,
      "facilities": ["wifi", "ac"], // parsed from JSON facilities array
      "images": ["https://..."],
      "basePrice": 450000,
      "active": true
    }
  ]
}
```

**Notes:**
- Parse city from last segment of address (e.g., "Bali" or "Sanur") — document clearly as heuristic.
- Facilities/images are JSON; normalize to webview-friendly arrays.
- If rooms have no RatePlans, use single default package derived from base price.

### `GET /api/public/bookings/:code?phone=` (TenantScoped, no auth)
Returns minimal booking status view for guest-facing polling (no JWT required). Requires `code` path param and optionally `phone` query param for verification (more secure than code-only):

```json
{
  "code": "TEST-2026-A1B2C3D4",
  "status": "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED",
  "total": 940000,
  "subtotal": 900000,
  "taxAmount": 90000,
  "discountAmount": 50000,
  "serviceAmount": 0,
  "checkIn": "2026-11-14",
  "checkOut": "2026-11-16",
  "guestName": "Tamu TEST", // masked if phone mismatch
  "createdAt": "2026-11-14T08:00:00Z"
}
```

**Security notes:**
- `phone` parameter is optional but recommended for privacy (prevents code enumeration attacks).
- If phone provided and doesn't match booking, mask sensitive fields.
- Return 404 if booking not found.

---

## Implementation Contract (FROZEN — import from this definition)

### Webview client helpers (`src/lib/api/*`)

#### Config (`src/lib/api/config.ts`)
```typescript
export const NGINEP_API_URL = process.env.NEXT_PUBLIC_NGINEP_API_URL ?? '';
export const NGINEP_TENANT_HEADER = 'x-nginep-tenant';
export const DEFAULT_TENANT = process.env.NEXT_PUBLIC_NGINEP_TENANT ?? '';
export const API_ENABLED = (): boolean => NGINEP_API_URL.length > 0;
```

#### Client (`src/lib/api/client.ts`) — browser-only
```typescript
export const apiFetch = async <T>(path: string, init?: {method?: string; body?: object}): Promise<T>;
// Adds X-Nginep-Tenant header from URL query or sessionStorage; forwards Authorization if present.
```

#### Proxy routes (`src/app/api/nginep/[...path]/route.ts`) — server-only
```typescript
// GET/POST/PATCH: proxy to `${NGINEP_API_URL}/${path}` with headers: x-nginep-tenant, authorization, content-type, idempotency-key
// Returns 400 when tenant missing; 502 when upstream unreachable
```

#### Mappers (`src/services/*`)
All mappers produce internal webview types exactly as defined in `booking.ts`, `bridge.ts`.

### New API endpoints (`code/apps/api/src/storefront/`)

Files owned by **agent A (API)**:
- `src/storefront/hotel-profile.controller.ts` — `GET /api/public/hotel-profile`
- `src/storefront/booking-status.controller.ts` — `GET /api/public/bookings/:code`
- `src/storefront/*.interface.ts` — DTO interfaces
- Register in `app.module.ts` (single line addition)

Owner must:
- Run existing tests only (`npm test`) — do NOT modify tests
- Verify: `curl -H 'x-nginep-tenant: grand-dian' http://localhost:9120/api/public/hotel-profile` returns JSON


---

## Deployment (homelab, baremetal — no Docker)

| Item | Value |
| --- | --- |
| API host | `stayin-api.solvin.id` → `127.0.0.1:9130` |
| WebView host | `stayin.solvin.id` → `127.0.0.1:3140` |
| API unit | `stayin-api.service` (user `stayin`, `/opt/stayin-api`, `dist/main.js`) |
| WebView unit | `stayin-webview.service` (Next standalone, `/opt/stayin-webview/server.js`) |
| Node runtime | `/opt/stayin-node/bin/node` (self-contained copy, v24.22.1) |
| Env files | `/etc/stayin/stayin-api.env` (Postgres + Redis + JWT), `/etc/stayin/stayin-webview.env` (`NGINEP_API_URL=http://127.0.0.1:9130`) |
| Database | PostgreSQL 17 database `stayin`, app role `stayin`, migration role `stayin_migrator` (BYPASSRLS) |
| Redis | local instance, DB index 3 (`REDIS_URL=redis://127.0.0.1:6379/3`), 60s hotel-profile cache; no-ops when unavailable |
| CI | Woodpecker `solvin-id/fs-stayin-engine` (main) + `solvin-id/fe-stayin-webview` (dev), local backend, deploy via `/usr/local/bin/stayin*-ci-deploy` |

CI flow: clone → build (blocking) → tests (non-blocking while the upstream suite is red) → `prisma migrate deploy`
+ `deploy/stayin-db-grants.sql` → stage `pnpm deploy --prod` output → restart unit → health check on the port.

DNS cutover needs a `cloudflared` connector inside the account that owns `solvin.id` (a tunnel CNAME
must live in the tunnel's own account): install with `/usr/local/bin/stayin-tunnel-install <token>`
and apply `/etc/stayin/tunnel-ingress.yml` as the tunnel's remote configuration.

# Integrasi Backend (untuk tim BE)

Frontend ini berjalan **tanpa backend** menggunakan data mock. Dokumen ini menjelaskan di mana data berasal, sehingga integrasi BE cukup mengganti sumber data tanpa mengubah tampilan.

## Menjalankan proyek

```bash
git clone <repo>
cd fe-stayin-webview
npm ci
npm run dev      # http://localhost:3000
```

Data mock langsung tampil tanpa konfigurasi tambahan. Tidak ada file `.env` yang dibutuhkan.

## Di mana data mock berada

| Kebutuhan | File | Export |
| --- | --- | --- |
| Katalog hotel + kamar + paket + harga | `src/data/hotelCatalog.ts` | `HOTELS` |
| Grup/management hotel | `src/data/hotelGroups.ts` | `HOTEL_GROUPS` |
| Metode pembayaran, profil tamu default, pencarian default | `src/data/mockData.ts` | `PAYMENT_METHODS`, `GUEST_PROFILE`, `DEFAULT_SEARCH` |
| Layanan sewa & makanan | `src/data/serviceCatalog.ts` | `RENT_VEHICLES`, `FOOD_MENUS`, `PROMO_BANNERS` |
| Helper query | `src/data/hotels.ts`, `src/data/hotelGroups.ts` | `getHotelById`, `getRoomsByHotel`, `getLowestNightlyRate`, `getHotelGroups`, … |

## Status integrasi (per November 2026)

Lapisan API **sudah ada** dan aktif bila `NEXT_PUBLIC_NGINEP_ENABLED=true`:
klien `src/lib/api/client.ts` memanggil BFF `/api/nginep/*`, mapper ada di
`src/services/*` (`hotel.service.ts`, `availability.service.ts`,
`quote.service.ts`, `booking.service.ts`). Endpoint tenant yang dipakai:

- `GET /storefront/hotel-profile` — profil properti (alamat, bintang, rating, jam, hero/gallery, fasilitas) + kamar.
- `POST /availability` — penawaran kamar; tiap offer membawa `package` (meal plan, sarapan, kebijakan pembatalan, harga coret).
- `POST /storefront/quote` — rincian biaya checkout dari server (subtotal, pajak, layanan, diskon, total).
- `POST /booking` — reservasi; menerima `specialRequests`, `notes`, `ratePlanId`.
- `GET /storefront/bookings/:code` — status reservasi.

Foto properti/kamar disajikan `GET {MEDIA_BASE}/api/media/<key>` (tanpa header tenant;
tenant diambil dari key). Bila integrasi dimatikan, UI kembali ke data mock.

## Titik integrasi yang disarankan

Urutan penggantian yang dulu disarankan untuk data mock (dipertahankan sebagai
referensi historis):

1. **Katalog hotel** — ganti `HOTELS` (tipe `HotelListing[]`, lihat `src/types/booking.ts`) dengan respons `GET /hotels`. Pertahankan bentuk tipe yang sama agar komponen tidak perlu diubah.
2. **Daftar kamar** — `GET /hotels/:id/rooms` mengisi `HotelListing.rooms`.
3. **Pembuatan booking** — dipanggil di `useBookingStore.startPayment()` (`src/stores/useBookingStore.ts`). Ganti pembuatan objek `booking` lokal dengan respons API, lalu simpan `booking.reference` dari server.
4. **Konfirmasi pembayaran** — `confirmPayment()` saat ini hanya mengubah status menjadi `PAID`. Ganti dengan pemanggilan gateway/`POST /payments/:reference/confirm`.
5. **Status pembayaran** — belum ada polling/webhook. Tambahkan pengecekan status agar halaman pembayaran menyesuaikan status sebenarnya; tombol "Saya Sudah Bayar" saat ini murni simulasi.
6. **Sewa & makanan** — belum memiliki layanan API; lihat "Rencana selanjutnya".

## Tipe data kontrak

Semua tipe ada di `src/types/`:

- `booking.ts` — `Hotel`, `Room`, `RoomPackage`, `GuestDetails`, `PriceSummary`, `Booking`, `PaymentInfo`
- `service.ts` — `RentVehicle`, `FoodMenuItem`, `ServiceDraft`, `ServicePayment`, `ServiceTotals`
- `account.ts` — `MemberProfile`, `HistoryRecord` (dipakai riwayat & voucher)

Bila BE mengembalikan nama field berbeda, buat mapper di `src/services/` dan biarkan tipe internal tetap. Contoh pola: `src/services/voucher.service.ts`.

## Autentikasi member

`src/stores/useSessionStore.ts` menyimpan `member` dan `history` di `localStorage` (kunci `sango-session`). Belum ada login sungguhan (tanpa password, tanpa token). Untuk integrasi:

- Ganti `login()` dengan pemanggilan `POST /auth/login`, simpan token di tempat yang aman.
- Ganti `useHostContext()` (`src/hooks/useHostContext.ts`) bila token dikirim lewat query string dari aplikasi host (`?token=…&tenant_id=…&source=alfateve`).

## Bridge webview (Alfa Teve)

`src/services/bridge.service.ts` mengirim pesan ke aplikasi host melalui `AlfaTeveBridge` → `AndroidBridge` → iOS `webkit.messageHandlers.AlfaTeveBridge` → `window.parent.postMessage`. Pesan yang dikirim: `{ type: 'CLOSE_WEBVIEW' }` dan `{ action: 'close_webview' }`.

## Rencana selanjutnya (belum ada di repo ini)

Repo frontend **Stayin** ini hanya berisi alur reservasi kamar. Fitur layanan sewa kendaraan dan pesan makanan dikembangkan di proyek terpisah (`sangohotel-webview`) dan **belum diintegrasikan** ke sini. Jika nanti digabung, bagian yang perlu ditambahkan: `src/stores/useServiceStore.ts`, `src/components/service/*`, dan `src/services/receipt.service.ts` (PDF).

## Catatan teknis

- Next.js 15 App Router, React 19, TypeScript strict, Tailwind, Zustand.
- Seluruh navigasi memakai state (`src/stores/useBookingStore.ts` → `step` 1–6), bukan route Next. Menambah endpoint tidak memerlukan perubahan routing.
- `npm test` (Vitest + Testing Library) dan `npx tsc --noEmit` harus tetap 0 error setelah perubahan.

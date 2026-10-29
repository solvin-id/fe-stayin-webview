# PROJECT HISTORY — StayIn Webview (recovered)

Dokumen ini adalah ringkasan riwayat pengembangan yang dipulihkan dari sesi ZCode lama
`sess_faf37ff1-f6e9-469c-bad8-8cb9ddb0e0b2` ("Stayin Webview Hotel Booking Frontend").

- Path lama: `D:\Kerja\Alfa Teve\StayIn` (sudah dihapus / dipindah)
- Path sekarang: `D:\Kerja\Alfa Teve\StayInApp\frontend\webview-frontend`
- Status akhir sesi lama: **COMPLETE** — tidak ada pekerjaan yang tersisa/menghambat.
- Verifikasi pemulihan: 55 file di `src/`, seluruh komponen, `README.md`, `Requirement/`, dan `Rules/` ada di path baru.

## Stack & konfigurasi

- Next.js **15.5.28** (App Router, di-upgrade dari 15.1.6 untuk CVE-2025-66478)
- TypeScript strict, Tailwind CSS 3.4.17, Zustand, Lucide, clsx + tailwind-merge
- Mobile viewport 390×844; desktop menampilkan frame 480px di tengah
- Demo tanpa backend (mock data)

## Alur 5 layar (copy Bahasa Indonesia)

1. Listing kamar + search bar sticky — Grand Horizon Hotel Solo, Jl. Slamet Riyadi No. 128, Surakarta
2. Modal tanggal/tamu → detail kamar (carousel, paket, fasilitas, kebijakan)
3. Checkout (form tamu, chips special request, toggle "Pesan untuk orang lain", price breakdown + 10% Tax & Service + Promo Alfa Teve)
4. Pembayaran (BCA VA / Mandiri VA / GoPay-QRIS / Kartu Kredit, countdown 15 menit, dialog kedaluwarsa, toast copy VA)
5. E-Voucher (mock QR SVG, download ringkasan, share WhatsApp, bridge `close_webview`)

## Keputusan arsitektur

- Single-page step wizard (`step: 1–5` di Zustand) agar state tidak hilang antar layar di webview.
- Pricing & format tanggal hanya lewat `lib/formatters.ts` (manual, hindari hydration mismatch ICU/timezone).
- Warna dibatasi token `#0194F3` (primary) dan `#FF5E1F` (action).
- Touch target ≥ 44px, safe-area inset, file komponen `.tsx` ≤ 150 baris, tanpa `any`, tanpa `console.*`, tanpa TODO/FIXME di `src`.
- Pengecualian aturan 150 baris: `data/mockData.ts` (272 baris) dan `stores/useBookingStore.ts` (183 baris).
- QR voucher = mock SVG deterministik (tidak bisa discan), sesuai spesifikasi.
- Bridge: back di root → kirim `{ action: "close_webview" }`; back di detail menutup modal lebih dulu (history guard).
- Deep-link demo: `/?token=demo-jwt&tenant_id=HTL-SOLO-01&source=alfateve` → badge "Terhubung via Alfa Teve" + auto-fill profil [Rian Kusuma].

## Perintah

```bash
npm install
npm run dev        # http://localhost:3000
npx tsc --noEmit   # 0 error
npm run build      # sukses, First Load JS 138 kB (route / 34.9 kB)
```

Jika muncul error hot-reload `__webpack_modules__[moduleId] is not a function` atau
`Could not find the module ... SegmentViewNode`: `rm -rf .next && npm run dev`.

## Bug yang pernah diperbaiki

1. **Logika date picker** (`DateGuestPickerModal.tsx`): saat checkout masih kosong, tap tanggal yang lebih akhir malah mereset check-in. Fix:
   `if (!checkIn || iso <= checkIn) { setCheckIn(iso); setCheckOut(''); return; } setCheckOut(iso);`
2. Teks tanggal terpotong di search bar → format kompak `14 Nov - 16 Nov`, tahun di baris kedua.
3. Badge "Room Only" redundan (duplikat nama paket) dihapus.
4. Body kosong setelah refactor (27 skeleton nyangkut) → penyebabnya cache `.next` basi, bukan kode; rebuild bersih menyelesaikan.

## Skenario yang sudah diverifikasi

- Badge + autofill profil; 14→23 Nov = "9 Malam".
- Pilihan paket ("Termasuk Sarapan 2 Orang") terbawa ke checkout.
- Total sesuai PRD: 2 malam = Rp 1.600.000; 9 malam × Rp 750.000 = Rp 6.385.000; total pembayaran termasuk pajak Rp 7.375.000.
- Validasi email/WhatsApp; toggle "orang lain" mewajibkan nama.
- Countdown berjalan dan kedaluwarsa 15 menit menonaktifkan tombol bayar.
- Toast copy VA; QRIS render; voucher `STY-2026-XXXXX` LUNAS; download berhasil; link WhatsApp terbentuk.
- Payload `close_webview` persis sesuai kontrak; listing render 3 kartu (0 skeleton).

## Preferensi pengguna / aturan tetap

- Seluruh copy UI **Bahasa Indonesia**; branding "StayIn" / "Terhubung via Alfa Teve".
- Harus sesuai **PRD** (harga, breakdown, room lock 15 menit, kontrak `close_webview`).
- Fokus polish: review screenshot berulang, cek kontras (`#0A64A4` di atas `#EBF5FF` diterima), tidak boleh ada runtime error.
- QA browser via `mcp__node_repl__js` / `setupBrowserRuntime`; jika klik locator Playwright macet di bottom sheet beranimasi, fallback ke `el.click()` setelah `scrollIntoView` lalu verifikasi ulang lewat `[role="dialog"]`.

## Sisa pekerjaan

Tidak ada yang menghambat. Satu-satunya loose end: todo "Write README with terminal commands" sempat menggantung, tetapi `README.md` sudah ada — cukup dicek/diperbarui bila perlu.

## Perubahan setelah pemulihan (29 Okt 2026)

Alur diubah dari 5 layar menjadi **6 layar**: daftar hotel sekarang menjadi layar pertama, sebelum daftar kamar.

- `BookingStep` diperluas menjadi `1–6`. Urutan baru: 1 daftar hotel → 2 daftar kamar → 3 detail kamar (modal) → 4 checkout → 5 pembayaran → 6 voucher.
- Data katalog hotel dipindah ke modul baru `src/data/hotels.ts` berisi 3 hotel (Grand Horizon Solo, Amaris Solo, The Royal Surakarta Heritage) beserta kamar & paketnya. `src/data/mockData.ts` kini hanya menyimpan metode pembayaran, profil tamu, dan search default.
- Store mendapat `selectedHotelId`, action `selectHotel`, dan `startNewBooking`; `startPayment` memakai hotel terpilih; `restartAfterExpiry` kembali ke layar kamar hotel yang sama.
- Komponen baru: `components/hotels/HotelsScreen.tsx`, `HotelList.tsx`, `HotelCard.tsx`.
- `RoomsScreen`, `RoomList`, `HotelInfoCard`, `RoomDetailModal` sekarang menerima hotel/kamar sebagai props, tidak lagi membaca konstanta global.
- Di layar voucher ditambahkan tombol **Cari Hotel Lain** yang memanggil `startNewBooking()` untuk kembali ke daftar hotel.
- Verifikasi: `npx tsc --noEmit` 0 error, `npm run build` sukses (First Load JS 139 kB), alur end-to-end diuji di browser termasuk perpindahan hotel dan reset dari voucher.

## Penambahan: Search Hotel + Filter Kota (29 Okt 2026)

- Katalog diperluas dari 3 menjadi **7 hotel** di 4 kota: Surakarta (3), Yogyakarta (2), Semarang (1), Magelang (1). Data dipindah ke `src/data/hotelCatalog.ts`; `src/data/hotels.ts` kini hanya berisi helper query (`getHotelById`, `getRoomsByHotel`, `getLowestNightlyRate`, `getCityOptions`, dst).
- `src/lib/hotelFilter.ts`: `filterHotels()` (cocokkan nama hotel + kota + alamat, case-insensitive, digabung AND dengan filter kota) dan `buildCityOptions()` (kota unik + jumlah hotel, urut dari terbanyak).
- Komponen baru: `components/search/HotelSearchBar.tsx` (input search di area sticky, tinggi 52px, tombol clear 44px), `components/hotels/HotelFilterButton.tsx` (FAB pil kanan bawah dengan badge kota aktif), `components/hotels/CityFilterSheet.tsx` (bottom sheet pilihan kota + "Semua Kota" + tombol Terapkan).
- `HotelList` sekarang menerima prop `listings` dan punya **empty state** dengan tombol "Reset Pencarian".
- Store mendapat `hotelQuery`, `cityFilter`, `setHotelQuery`, `setCityFilter`, `resetHotelFilters`; keduanya direset di `startNewBooking`.
- Verifikasi: `npx tsc --noEmit` 0 error; di browser sudah diuji pencarian "yogya" (2 hasil), filter Semarang (1 hasil + badge), empty state + reset (kembali 7 hotel), dan persistensi filter setelah kembali dari daftar kamar.
- Catatan perilaku: pencarian memakai substring literal, jadi "jogja" tidak menemukan "Yogyakarta" — kata kunci harus sesuai ejaan data ("yogya" atau "yogyakarta").

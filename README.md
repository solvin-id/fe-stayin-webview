# Stayin Webview — Mobile Hotel Booking Engine

Frontend booking engine untuk **Alfa Teve** (in-app webview). Next.js 15 App Router, TypeScript strict, Tailwind CSS, Zustand, Lucide. Berjalan penuh dengan mock data — tanpa backend.

## Perintah Terminal

```bash
# 1. Install dependencies
npm install

# 2. Typecheck (opsional, harus 0 error)
npx tsc --noEmit

# 3. Jalankan development server
npm run dev
# buka http://localhost:3000

# Demo mode "terhubung Alfa Teve" (badge + auto-fill profil):
# http://localhost:3000/?token=demo-jwt&tenant_id=HTL-SOLO-01&source=alfateve

# 4. Build produksi
npm run build
npm start
```

## Deploy (Netlify)

Konfigurasi deploy ada di `netlify.toml` dan terbaca otomatis oleh Netlify:

| Item | Nilai |
| :--- | :--- |
| Build command | `npm run build` |
| Publish directory | `.next` |
| Node.js | 20 (`NODE_VERSION` + `.nvmrc` + `engines`) |
| Plugin | `@netlify/plugin-nextjs` |

Langkah:

1. Push repo ke GitHub.
2. Netlify → **Add new site** → **Import an existing project** → pilih repo.
3. Biarkan build settings apa adanya (diambil dari `netlify.toml`), lalu **Deploy**.
4. Setiap `git push` ke `main` akan otomatis men-deploy ulang.

Catatan:

- Aplikasi ini murni client-side (tanpa API route maupun environment variable), jadi tidak ada secret yang perlu diisi di Netlify.
- URL hasil deploy bersifat **publik tanpa autentikasi**. Jika perlu dibatasi, gunakan password protection Netlify atau letakkan di balik VPN/internal.
- Jangan pasang header `X-Frame-Options` atau CSP `frame-ancestors` yang memblokir, karena aplikasi ini memang dirancang di-embed sebagai webview di Alfa Teve.

### Badge "Powered by Netlify"

Pada paket gratis, Netlify menyuntik iframe `#nl-badge-frame` (fixed, 197×64 px, `z-index` maksimum) di pojok kanan bawah. Di layar ponsel badge itu menutupi tombol aksi bawah.

Solusinya bukan menyembunyikan badge (tidak diizinkan pada paket free), melainkan layout adaptif:

- `src/hooks/useHostBottomOffset.ts` mengukur tinggi badge dan mengecek apakah badge beririsan dengan frame 480px.
- Hasilnya dipasang sebagai CSS variable `--host-bottom-offset` di `src/app/page.tsx`.

Penerapannya:

- **Tombol Filter** (satu-satunya elemen floating di bawah) memakai offset pada `padding-bottom` pembungkusnya.
- **Bar aksi bawah** (`StickyActionBar`) sengaja **tidak floating** — ia mengalir normal di akhir konten, dan hanya `padding-bottom`-nya yang ditambah offset. Jadi tombol "Lanjut Bayar" dan "Saya Sudah Bayar" tetap terlihat penuh saat halaman di-scroll sampai bawah.
- **Toast** tampil di **atas layar**, di bawah header (`pt-[calc(env(safe-area-inset-top,0px)+64px)]`), supaya tidak menutupi tombol aksi mana pun.

Efeknya: offset 64px di ponsel, 0px di desktop lebar, dan 0px di webview Alfa Teve (tanpa badge). Untuk menghapus badge sepenuhnya perlu Netlify Pro atau pindah ke hosting lain.

## Alur 6 Layar

| Step | Layar | Komponen |
| :--- | :--- | :--- |
| 1 | Daftar hotel + search & filter kota | `hotels/HotelsScreen`, `HotelSearchBar`, `HotelFilterButton`, `CityFilterSheet`, `HotelCard` |
| 2 | Listing kamar hotel terpilih + search bar sticky | `rooms/RoomsScreen`, `HotelInfoCard`, `RoomCard` |
| 3 | Detail kamar & kebijakan | `RoomDetailModal`, `room/RoomPolicies`, `room/PackageSelector` |
| 4 | Form pemesanan & rincian biaya | `CheckoutSection`, `checkout/GuestForm`, `checkout/PriceBreakdown` |
| 5 | Pembayaran + countdown 15 menit | `PaymentSection`, `payment/*` |
| 6 | E-voucher + QR check-in, tombol **Cari Hotel Lain** | `VoucherSection`, `voucher/*` |

State dialirkan lewat satu Zustand store (`src/stores/useBookingStore.ts`), sehingga pindah layar tidak kehilangan data. Setelah pembayaran, tombol **Cari Hotel Lain** memanggil `startNewBooking()` untuk mereset pilihan hotel/kamar **dan filter** lalu kembali ke layar 1.

### Search & Filter Kota (Layar 1)

- Field search berada di area sticky tepat di bawah header, mencocokkan **nama hotel, kota, dan alamat** secara case-insensitive.
- Tombol **Filter** mengambang di kanan bawah membuka bottom sheet `CityFilterSheet` berisi opsi kota dinamis (dari data) plus "Semua Kota", lengkap dengan jumlah hotel per kota.
- Kata kunci dan filter kota digabung dengan logika AND. Bila hasil kosong, muncul empty state dengan tombol **Reset Pencarian**.
- Filter tetap tersimpan saat pengguna masuk ke daftar kamar lalu kembali, dan baru dibersihkan saat memulai pemesanan baru.
- Data katalog ada di `src/data/hotelCatalog.ts` (7 hotel di Surakarta, Yogyakarta, Semarang, Magelang); helper query ada di `src/data/hotels.ts`, logika filter di `src/lib/hotelFilter.ts`.

## Palet Warna

Palet resmi Stayin (menggantikan biru lama):

| Warna | Hex | Token Tailwind | Pemakaian |
| --- | --- | --- | --- |
| Orange | `#EB6430` | `primary` | Header, tombol utama, step aktif, ikon & teks aksen |
| Orange hover | `#DF4F16` | `primary-hover` | State hover/pressed elemen primary |
| Orange gelap | `#B03E11` | `primary-dark` | Teks di atas latar `primary-surface` |
| Orange muda | `#FDF0EA` | `primary-surface` | Badge terpilih, info box, panel VA |
| Putih | `#FFFFFF` | `white` | Latar kartu & teks di atas orange |
| Hitam ke biru tua | `#05071C` | `slate-900`/`#0F172A` | Teks utama, QR code |

Aksen CTA sekunder tetap memakai token `action` (`#FF5E1F`) agar beda tipis dengan `primary`. Semua warna didefinisikan di `tailwind.config.ts`; `themeColor` browser ada di `src/app/layout.tsx`.

## Struktur

```
src/
├── app/            layout.tsx (frame 480px, safe-area), page.tsx (orkestrasi step), globals.css
├── components/     Header, DateGuestPickerModal, RoomCard, RoomDetailModal,
│                   CheckoutSection, PaymentSection, VoucherSection
│   ├── ui/         Button, Badge, BottomSheet, Skeleton, ToastHost, StickyActionBar
│   ├── hotels/     HotelsScreen, HotelList, HotelCard, HotelFilterButton, CityFilterSheet
│   ├── search/     SearchSummaryBar, HotelSearchBar, CalendarGrid, GuestCounter, SelectedDateSummary
│   ├── room/       RoomImageCarousel, RoomPackageOption, RoomPolicies, PackageSelector, FacilityIcon
│   ├── checkout/   GuestForm, SpecialRequestChips, PriceBreakdown
│   ├── payment/    PaymentCountdownBanner, PaymentMethodList, VirtualAccountPanel, QrisPanel, CreditCardPanel, PaymentExpiredDialog
│   ├── voucher/    MockQrCode, VoucherDetails, VoucherActions
│   ├── rooms/      RoomsScreen, RoomList, HotelInfoCard
│   └── common/     StepProgress
├── data/           hotelCatalog.ts (7 hotel + kamar/paket), hotels.ts (helper query), mockData.ts (metode bayar, profil tamu, search default)
├── types/          booking.ts, bridge.ts
├── lib/            formatters, date, pricing, validation, hotelFilter, utils (cn)
├── stores/         useBookingStore.ts
├── hooks/          useCountdown, useHostContext, useWebviewBack
└── services/       bridge.service.ts, voucher.service.ts
```

## Integrasi Alfa Teve

Query param yang dibaca: `token`, `tenant_id`, `source`. Bila `source=alfateve` (atau token + tenant_id ada), header menampilkan badge **"Terhubung via Alfa Teve"** dan form pemesanan terisi otomatis.

Bridge native (`src/services/bridge.service.ts`) mencoba berurutan: `AlfaTeveBridge` → `AndroidBridge` → iOS `webkit.messageHandlers.AlfaTeveBridge` → `window.parent.postMessage`.

Tombol **"Kembali ke Alfa Teve"** mengirim `window.parent.postMessage({ action: 'close_webview' }, '*')`. Saat aplikasi di-embed (iframe/webview), tombol back fisik akan menutup modal → mundur satu step → baru mengirim `close_webview` pada layar daftar hotel atau voucher.

## Catatan Mock

- Harga & tanggal selalu lewat `lib/formatters.ts` (format manual, tanpa `Intl`, agar bebas hydration mismatch).
- QR voucher adalah mock SVG deterministik (hash dari kode booking), bukan QR yang bisa dipindai sungguhan.
- Tombol "Saya Sudah Bayar" mensimulasikan sukses; countdown 15 menit memicu dialog "Waktu Pemesanan Habis".

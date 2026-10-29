# Product & Technical Requirement Document (PRD-FE)

## Stayin Mobile Webview – Integrated Hospitality Booking Engine
* **Project Name:** Stayin Booking Engine (Mobile Webview Edition)
* **Target Host:** Alfa Teve Mobile Application (Android & iOS In-App Webview)
* **Framework:** Next.js 15+ (App Router, TypeScript, Tailwind CSS)
* **Design Benchmark:** Traveloka Mobile Web / In-App Hotel Flow
* **Document Version:** 1.0.0 (Production Blueprint)

---

## 1. Visi Produk & Sasaran Bisnis

### 1.1 Ringkasan Eksekutif
**Stayin Webview** adalah modul mesin reservasi hotel (*direct booking engine*) mandiri berbasis web responsif yang dirancang untuk disematkan langsung (*embedded webview*) ke dalam salah satu tab menu aplikasi mobile **Alfa Teve**. 

Tujuan utama produk ini adalah memberikan pengalaman pemesanan kamar yang instan, mulus (*native-like experience*), dan tanpa friksi (tanpa perlu login ulang), sekaligus mendistribusikan inventaris hotel secara langsung kepada basis pengguna aktif Alfa Teve.

### 1.2 Sasaran Utama (Key Objectives)
1. **Zero Login Friction:** Autentikasi otomatis menggunakan pertukaran *session token* dari aplikasi Alfa Teve ke aplikasi Stayin.
2. **High-Conversion UX:** Mengadopsi pola antarmuka industri OTA kelas atas (ala Traveloka) dengan navigasi satu jempol (*one-thumb friendly*), komponen *bottom-sheet picker*, dan *sticky booking summary*.
3. **Optimized for Embedded Browsers:** *First Contentful Paint* (FCP) di bawah $1.5$ detik dan *Largest Contentful Paint* (LCP) di bawah $2.5$ detik pada koneksi 4G seluler.
4. **Seamless Payment Handshake:** Menangani transisi pembayaran *deep-link* perbankan/e-wallet tanpa merusak riwayat navigasi (*history stack*) webview.

---

## 2. Desain Sistem & Panduan Visual (Design System)

Tampilan antarmuka mengadopsi standar visual modern dengan kontras tinggi untuk memperjelas hierarki informasi dan mendorong konversi tombol aksi.

### 2.1 Palet Warna (Color Tokens)

| Peran Token | Kode Hex | Penggunaan UI |
| :--- | :--- | :--- |
| `primary-blue` | `#0194F3` | Header utama, tab aktif, ikon fasilitas prioritas, link, aksen kalender |
| `primary-blue-dark` | `#0A64A4` | State hover/pressed elemen biru, outline fokus |
| `primary-blue-surface` | `#EBF5FF` | Latar belakang badge terpilih, info box, container penanda tanggal terpilih |
| `secondary-orange` | `#FF5E1F` | Tombol CTA utama ("Pilih Kamar", "Lanjut Pembayaran"), badge urgensi |
| `secondary-orange-hover` | `#E04F16` | State aktif/tekan tombol konversi |
| `secondary-orange-soft` | `#FFF3ED` | Tag promo, penanda "Sisa 2 Kamar Lagi!", banner diskon eksklusif |
| `surface-canvas` | `#F7F9FA` | Latar belakang kanvas aplikasi (memberikan efek elevasi kartu) |
| `surface-card` | `#FFFFFF` | Latar belakang kartu kamar, bottom-sheet, modal, navbar |
| `text-primary` | `#0F172A` | Judul, nama kamar, harga final, teks tebal |
| `text-secondary` | `#64748B` | Subtitle, fasilitas pendukung, tanggal, teks placeholder |
| `border-subtle` | `#E2E8F0` | Garis pemisah (*divider*), border kartu kamar |
| `badge-success` | `#10B981` | Penanda "Termasuk Sarapan", "Bisa Refund" |

### 2.2 Tipografi & Ikonografi
* **Font Family:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, sans-serif.
* **Ukuran & Berat Huruf:**
  * Title / Price Heading: `18px` – `20px` (Font-Weight: 700 / Bold).
  * Sub-heading / Room Name: `15px` – `16px` (Font-Weight: 600 / Semi-Bold).
  * Body Text: `13px` – `14px` (Font-Weight: 400 & 500).
  * Caption & Badges: `11px` – `12px` (Font-Weight: 500 & 600).
* **Ikonografi:** `lucide-react` (Ikon: Bed, Users, Calendar, Wifi, Utensils, ArrowLeft, ShieldCheck, Clock, MapPin, ChevronDown, Check).

### 2.3 Aturan Komponen & Interaksi
* **Area Sentuh (Tap Targets):** Seluruh tombol dan kontrol navigasi memiliki area minimal $44 \times 44\text{ px}$.
* **Border Radius:** Kartu kamar dan modal menggunakan sudut melengkung `rounded-xl` ($12\text{ px}$) atau `rounded-2xl` ($16\text{ px}$).
* **Elevation & Shadow:** Bayangan kartu lembut `shadow-sm` (`rgba(0, 0, 0, 0.05) 0px 1px 3px`).

---

## 3. Arsitektur Jembatan Webview & Integrasi Alfa Teve

Karena Stayin dijalankan di dalam *in-app browser* milik Alfa Teve, diperlukan mekanisme komunikasi dua arah (*bidirectional bridge*).

### 3.1 Format Inisialisasi URL & Autentikasi (SSO Handshake)
Alfa Teve membuka Webview Stayin menggunakan struktur URL:
```
https://stayin.domain.com/webview/entry?token={JWT_SESSION_TOKEN}&tenant_id={HOTEL_ID}&source=alfateve&theme=light
```

1. **Token Extraction:** Middleware Next.js membaca parameter `token` dan `tenant_id`.
2. **Backend Handshake:** Client memanggil `GET /v1/webview/init` dengan mengirimkan token untuk mendapatkan profil pengguna (Nama, Email, No HP) dan data konfigurasi hotel.
3. **Session Storage:** Data profil dan token disimpan ke dalam memory state (Zustand) dan cookie aman `httpOnly: false` untuk transaksi berikutnya.

### 3.2 Protokol JavaScript Bridge (PostMessage)
Komunikasi antara webview dan aplikasi *native* Alfa Teve menggunakan standar antarmuka berikut:

```typescript
// types/bridge.ts
export type NativeBridgeAction = 
  | { type: 'CLOSE_WEBVIEW' }
  | { type: 'NAVIGATE_BACK'; canGoBack: boolean }
  | { type: 'OPEN_DEEP_LINK'; url: string }
  | { type: 'BOOKING_SUCCESS'; bookingId: string }
  | { type: 'SHARE_VOUCHER'; text: string; url: string };

export const sendToNativeApp = (payload: NativeBridgeAction) => {
  if (typeof window !== 'undefined') {
    // Android Interface
    if ((window as any).AlfaTeveBridge?.postMessage) {
      (window as any).AlfaTeveBridge.postMessage(JSON.stringify(payload));
    } 
    // iOS WebKit Interface
    else if ((window as any).webkit?.messageHandlers?.AlfaTeveBridge?.postMessage) {
      (window as any).webkit.messageHandlers.AlfaTeveBridge.postMessage(payload);
    } 
    // Fallback standard postMessage
    else {
      window.parent.postMessage(payload, '*');
    }
  }
};
```

### 3.3 Penanganan Tombol Back Fisik (Android Back Button)
* Jika pengguna berada di Halaman Detail Kamar, Form Pemesanan, atau Calendar Picker: Tombol *back* fisik menutup modal/kembali ke layar listing kamar (`history.back()`).
* Jika pengguna berada di Halaman Katalog Utama (Home): Tombol *back* mengirim aksi `{ type: 'CLOSE_WEBVIEW' }` ke native Alfa Teve untuk mengembalikan pengguna ke tab utama aplikasi induk.

### 3.4 Penanganan Safe Area Insets (CSS Notches)
Aplikasi webview wajib menyertakan meta viewport khusus dan utilitas Tailwind:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```
```css
/* Mengatur padding notch atas dan bilah navigasi gestur bawah */
.safe-top {
  padding-top: env(safe-area-inset-top, 0px);
}
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

## 4. Alur Pengguna (User Flow) & Spesifikasi Layar

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ALUR PENGGUNA STAYIN                            │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Layar 1: Bar Pencarian & Ringkasan Tanggal (Sticky Top)                │
│ • Menampilkan: Nama Hotel, Tanggal Menginap, Durasi Malam, Tamu       │
│ • Klik memicu Bottom Sheet Date & Guest Selector                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Layar 2: Katalog Kamar (Room Listing - Gaya Traveloka)                 │
│ • Kartu Kamar: Carousel Foto, Luas (m²), Tipe Ranjang, Kapasitas       │
│ • Opsi Paket: Kamar Saja vs Termasuk Sarapan                          │
│ • Aksen Oranye: Badge "Sisa 2 Kamar!" & Tombol "Pilih"                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Layar 3: Detail Kamar & Kebijakan Menginap (Modal / Bottom Sheet)      │
│ • Galeri Foto Layar Penuh                                              │
│ • Rincian Fasilitas Kamar & Hotel                                      │
│ • Kebijakan Pembatalan (Bisa Refund / Non-Refundable) & Aturan Check-in│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Layar 4: Form Pemesanan & Ringkasan Tarif (Checkout)                   │
│ • Auto-fill otomatis identitas pemesan dari akun Alfa Teve            │
│ • Toggle "Pesan untuk Orang Lain"                                      │
│ • Pilihan Special Request (Non-smoking, High Floor, Ranjang Besar)     │
│ • Rincian Harga: Harga Bersih, Pajak & Biaya Layanan, Total Akhir      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Layar 5: Transaksi & Hitung Mundur Pembayaran (Payment Gateway)        │
│ • Timer 15 Menit untuk mengunci kamar                                  │
│ • Metode Pembayaran: QRIS, Virtual Account (BCA, Mandiri, BRI), E-Wallet│
│ • Deep link redirect handler untuk aplikasi perbankan                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Layar 6: Bukti Pemesanan Digital (E-Voucher)                           │
│ • Booking ID & QR Code untuk Check-in di Front Desk Hotel              │
│ • Rincian Lokasi Hotel & Tombol Buka Google Maps                       │
│ • Aksi: "Kirim ke WhatsApp" & "Kembali ke Alfa Teve"                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Rincian Antarmuka Layar (Screen Specifications)

### 5.1 Layar 1 & 2: Search Bar & Katalog Kamar (Listing Screen)

```
┌────────────────────────────────────────────────────────┐
│ [←] Grand Horizon Hotel Solo                 [Share]   │ <-- Primary Blue Bar
├────────────────────────────────────────────────────────┤
│ 📅 14 Nov - 16 Nov (2 Malam)  •  👤 2 Tamu, 1 Kamar [✎]│ <-- Search Pill Sticky
├────────────────────────────────────────────────────────┤
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [ Foto Kamar Carousel (Swipe 1/4)                ] │ │
│ │ 🛈 Deluxe King Room                                │ │
│ │ 📐 28 m²  •  🛏️ 1 King Bed  •  👥 2 Tamu           │ │
│ │ 📶 Wifi Gratis  •  ❄️ AC Dingin  •  🚿 Hot Shower  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ Opsi 1: Tanpa Sarapan (Room Only)                  │ │
│ │ • Kebijakan: Tidak Dapat Dikembalikan              │ │
│ │ Rp650.000 / malam                                  │ │
│ │                              [  Pilih Kamar  ]     │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ Opsi 2: Termasuk Sarapan 2 Orang [Sarapan Gratis] │ │
│ │ • ⚡ Sisa 2 Kamar Lagi!                            │ │
│ │ ~Rp850.000~ Rp750.000 / malam                      │ │
│ │                              [  PILIH KAMAR  ]     │ <-- Tombol Oranye
│ └────────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

* **Komponen Penting:**
  * **Header Sticky:** Menampilkan nama properti dan tombol kembali ke Alfa Teve.
  * **Date Selector Bar:** Menampilkan ringkasan tanggal dengan ikon pensil. Ketika diketuk, memicu *Full-Height Bottom Sheet Datepicker* dengan visualisasi tarif terendah di bawah setiap tanggal.
  * **Room Card:**
    * *Image Carousel* rasio 16:9 dengan *indicator dots*.
    * *Badge Urgensi:* Latar `#FFF3ED`, teks `#FF5E1F`, muncul jika kuota kamar tersisa $\le 3$.
    * *Harga:* Menampilkan harga coret jika ada diskon promosi, dan harga final per malam dengan ukuran $16\text{ px}$ tebal.
    * *Tombol Aksi:* Tombol utama oranye `#FF5E1F` dengan teks putih "Pilih".

---

### 5.2 Layar 4: Form Pemesanan & Rincian Harga (Checkout)

```
┌────────────────────────────────────────────────────────┐
│ [←] Rincian Pemesanan                                  │
├────────────────────────────────────────────────────────┤
│ 🏨 Grand Horizon Hotel Solo                            │
│ Deluxe King Room (Termasuk Sarapan)                    │
│ Check-in: Kam, 14 Nov 2026 | Check-out: Sab, 16 Nov    │
├────────────────────────────────────────────────────────┤
│ DATA PEMESAN (Terisi Otomatis)                         │
│ Nama Lengkap:  [ Rian Kusuma                         ] │
│ No. WhatsApp:  [ 081234567890                        ] │
│ Alamat Email:  [ rian.kusuma@example.com             ] │
│                                                        │
│ [x] Saya memesan untuk orang lain                      │
├────────────────────────────────────────────────────────┤
│ PERMINTAAN KHUSUS (Tergantung Ketersediaan)            │
│ [ ] Bebas Asap Rokok  [ ] Lantai Tinggi  [ ] Check-in  │
├────────────────────────────────────────────────────────┤
│ RINCIAN BIAYA                                          │
│ Tarif Kamar (2 Malam x Rp750.000)        Rp1.500.000   │
│ Pajak & Biaya Pelayanan (10%)              Rp150.000   │
│ Diskon Promo Alfa Teve                    - Rp50.000   │
│ ────────────────────────────────────────────────────── │
│ Total Pembayaran                         Rp1.600.000   │
├────────────────────────────────────────────────────────┤
│ [ Total: Rp1.600.000  ▼ ]      [ LANJUT BAYAR ]        │ <-- Bottom Sticky Bar
└────────────────────────────────────────────────────────┘
```

* **Komponen Penting:**
  * *Auto-population:* Form otomatis terisi dari token identitas Alfa Teve.
  * *Input Masking:* Input nomor WhatsApp otomatis berawalan `+62` / `08`.
  * *Special Requests Chip:* Kumpulan *chips* pilihan cepat tanpa perlu mengetik panjang.
  * *Bottom Sticky Action Bar:* Mengunci rincian total harga di sebelah kiri dan tombol konversi oranye "Lanjut Bayar" di sebelah kanan.

---

### 5.3 Layar 5: Halaman Pembayaran & Countdown

* **Countdown Bar:** Banner oranye di bagian atas: *"Selesaikan pembayaran dalam 14:59 untuk mengamankan kamar Anda"*.
* **Opsi Metode Pembayaran:**
  * **QRIS:** Menampilkan gambar QR dinamis yang dapat disimpan (*Save Image*) atau di-scan langsung.
  * **Virtual Account:** Menampilkan nomor VA bank (BCA, Mandiri, BRI, BNI) lengkap dengan tombol salin (*Copy*) sekali sentuh dan panduan tata cara transfer.
  * **E-Wallet:** Tombol pemicu deep link (GoPay, ShopeePay, OVO).

---

### 5.4 Layar 6: Bukti Pemesanan Digital (E-Voucher)

* **Status Banner:** Latar hijau mint `#ECFDF5`, border `#A7F3D0`, ikon ceklis hijau.
* **Elemen Kunci:**
  * **Kode Reservasi:** Huruf tebal monospaced (misal: `STAY-882193-AF`) dengan tombol "Salin".
  * **QR Code Check-in:** Kode QR dinamis yang dapat langsung dipindai oleh resepsionis hotel pada layar PMS.
  * **Tombol Aksi:**
    * `Kirim Bukti ke WhatsApp`: Memicu pesan WA otomatis berisi ringkasan booking.
    * `Buka Petunjuk Arah`: Deep link menuju aplikasi Google Maps dengan koordinat hotel.
    * `Selesai`: Mengirim event `{ type: 'CLOSE_WEBVIEW' }` ke aplikasi induk Alfa Teve.

---

## 6. Spesifikasi Teknis Frontend (Next.js 15)

### 6.1 Struktur Direktori Proyek

Arsitektur aplikasi menggunakan pola modular berbasis App Router Next.js:

```
stayin-webview-fe/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout, Safe-area metadata, Provider
│   │   ├── page.tsx                   # Redirect ke /webview atau landing
│   │   ├── webview/
│   │   │   ├── entry/
│   │   │   │   └── page.tsx           # Entry point: validasi token & init SSO
│   │   │   ├── rooms/
│   │   │   │   ├── page.tsx           # Layar 1 & 2: Listing Kamar & Search
│   │   │   │   └── [roomId]/
│   │   │   │       └── page.tsx       # Layar 3: Detail Kamar Layar Penuh
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx           # Layar 4: Formulir Pemesanan & Rincian
│   │   │   ├── payment/[bookingId]/
│   │   │   │   └── page.tsx           # Layar 5: Status Bayar & Countdown
│   │   │   └── voucher/[bookingId]/
│   │   │       └── page.tsx           # Layar 6: E-Voucher Digital
│   │   └── api/                       # API Route Handler internal (BFF jika diperlukan)
│   ├── components/
│   │   ├── common/
│   │   │   ├── BottomSheet.tsx        # Bottom sheet reusable dengan gestur swipe
│   │   │   ├── StickyBottomBar.tsx    # Bar navigasi bawah untuk konversi harga
│   │   │   ├── SkeletonCard.tsx       # Shimmer placeholder untuk listing kamar
│   │   │   └── Toast.tsx              # Notifikasi feedback ringan
│   │   ├── search/
│   │   │   ├── DateRangePicker.tsx    # Kalender rentang tanggal gaya OTA
│   │   │   └── GuestRoomPicker.tsx    # Selektor jumlah tamu & kamar
│   │   ├── room/
│   │   │   ├── RoomCard.tsx           # Kartu kamar utama
│   │   │   ├── ImageCarousel.tsx      # Swipeable foto kamar dengan lazy-loading
│   │   │   └── FacilityChips.tsx      # Label fasilitas kamar
│   │   └── checkout/
│   │       ├── GuestForm.tsx          # Form data tamu
│   │       └── PriceBreakdown.tsx     # Komponen breakdown pajak & diskon
│   ├── hooks/
│   │   ├── useNativeBridge.ts         # Hook pendeteksi & pengirim event bridge
│   │   ├── useRoomAvailability.ts     # Hook TanStack Query untuk ketersediaan kamar
│   │   └── useCountdownTimer.ts       # Hook pewaktu mundur hold inventory
│   ├── lib/
│   │   ├── api-client.ts              # Axios/Fetch instance dengan interceptor
│   │   ├── bridge.ts                  # Logika postMessage native
│   │   └── formatters.ts              # Format mata uang (IDR) & format tanggal
│   ├── store/
│   │   ├── useBookingStore.ts         # Zustand store: tanggal, kamar terpilih, data tamu
│   │   └── useSessionStore.ts         # Zustand store: user profile, hotel metadata
│   └── types/
│       ├── api.ts                     # Tipe response backend
│       ├── booking.ts                 # Model kamar, transaksi, voucher
│       └── bridge.ts                  # Kontrak pesan bridge
├── public/
│   └── assets/                        # Logo, placeholder gambar kamar
├── tailwind.config.ts                 # Konfigurasi custom colors (blue, orange)
├── next.config.mjs                    # Konfigurasi image domain & header CSP
└── tsconfig.json
```

---

## 7. Kontrak API & Spesifikasi Integrasi Data

Frontend berkomunikasi dengan **Backend Orchestrator Express.js** menggunakan standar data JSON berikut:

### 7.1 Inisialisasi Sesi Webview
* **Endpoint:** `GET /v1/webview/init`
* **Query Parameters:** `token={string}&tenant_id={string}`
* **Headers:** `X-Client-Platform: alfateve-webview`
* **Response Sukses (200 OK):**
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "HTL-SOLO-01",
      "name": "Grand Horizon Hotel Solo",
      "address": "Jl. Slamet Riyadi No. 128, Surakarta",
      "star_rating": 4,
      "check_in_time": "14:00",
      "check_out_time": "12:00",
      "cover_image": "https://cdn.stayin.com/hotels/solo-01.jpg"
    },
    "guest_profile": {
      "user_id": "ALFA-99120",
      "full_name": "Rian Kusuma",
      "email": "rian.kusuma@example.com",
      "phone_number": "081234567890"
    },
    "currency": "IDR"
  }
}
```

### 7.2 Pencarian Ketersediaan Kamar
* **Endpoint:** `GET /v1/rooms/available`
* **Query Parameters:** `tenant_id=HTL-SOLO-01&check_in=2026-11-14&check_out=2026-11-16&guests=2&rooms=1`
* **Response Sukses (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_nights": 2,
    "rooms": [
      {
        "id": "ROOM-DLX-01",
        "name": "Deluxe King Room",
        "room_size_sqm": 28,
        "bed_type": "1 King Bed",
        "max_occupancy": 2,
        "images": [
          "https://cdn.stayin.com/rooms/dlx-1.webp",
          "https://cdn.stayin.com/rooms/dlx-2.webp"
        ],
        "facilities": ["Free High-Speed Wi-Fi", "AC", "Smart TV 43\"", "Hot Shower"],
        "packages": [
          {
            "package_id": "PKG-RO",
            "name": "Tanpa Sarapan (Room Only)",
            "includes_breakfast": false,
            "cancellation_policy": "NON_REFUNDABLE",
            "price_per_night": 650000,
            "total_price": 1300000,
            "units_left": 5
          },
          {
            "package_id": "PKG-BB",
            "name": "Termasuk Sarapan 2 Orang",
            "includes_breakfast": true,
            "cancellation_policy": "FREE_CANCELLATION_BEFORE_48H",
            "price_per_night": 750000,
            "original_price_per_night": 850000,
            "total_price": 1500000,
            "units_left": 2
          }
        ]
      }
    ]
  }
}
```

### 7.3 Hold Unit Kamar (Lock Inventory)
Ketika pengguna menekan tombol "Lanjut Bayar" pada Halaman Checkout, sistem mengunci kamar selama 15 menit.
* **Endpoint:** `POST /v1/bookings/hold`
* **Request Body:**
```json
{
  "tenant_id": "HTL-SOLO-01",
  "room_id": "ROOM-DLX-01",
  "package_id": "PKG-BB",
  "check_in": "2026-11-14",
  "check_out": "2026-11-16",
  "rooms_count": 1,
  "guest_info": {
    "name": "Rian Kusuma",
    "email": "rian.kusuma@example.com",
    "phone": "081234567890",
    "special_requests": ["NON_SMOKING", "HIGH_FLOOR"]
  }
}
```
* **Response Sukses (201 Created):**
```json
{
  "success": true,
  "data": {
    "hold_id": "HOLD-77128-XY",
    "expires_at": "2026-11-10T14:45:00Z",
    "expires_in_seconds": 900,
    "total_amount": 1600000
  }
}
```

### 7.4 Eksekusi Transaksi & Pembuatan Pembayaran
* **Endpoint:** `POST /v1/bookings/commit`
* **Request Body:**
```json
{
  "hold_id": "HOLD-77128-XY",
  "payment_method": "BCA_VA"
}
```
* **Response Sukses (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "BK-882193-AF",
    "status": "PENDING_PAYMENT",
    "payment": {
      "method": "BCA_VA",
      "va_number": "8271081234567890",
      "amount": 1600000,
      "expired_at": "2026-11-10T14:45:00Z",
      "instructions_url": "https://stayin.domain.com/pay/guide/bca"
    }
  }
}
```

### 7.5 Polling Status Pembayaran
* **Endpoint:** `GET /v1/bookings/:bookingId/status`
* **Response Status Berhasil (200 OK):**
```json
{
  "success": true,
  "data": {
    "booking_id": "BK-882193-AF",
    "payment_status": "PAID",
    "voucher_url": "/webview/voucher/BK-882193-AF"
  }
}
```

---

## 8. Optimasi Performa & Standar Keandalan Webview

Untuk memastikan webview berjalan sehalus aplikasi native tanpa lag:

1. **Optimalisasi Aset Gambar:**
   * Seluruh gambar kamar menggunakan komponen `next/image` dengan format modern `.webp` atau `.avif`.
   * Ukuran gambar kamar dibatasi maksimal $100\text{ KB}$ per gambar dengan atribut `loading="lazy"`, kecuali foto kartu pertama yang diberi atribut `priority`.
2. **State Caching & Prefetching:**
   * Menggunakan **TanStack Query** dengan durasi `staleTime: 60 * 1000` (1 menit) untuk daftar ketersediaan kamar, sehingga ketika pengguna kembali dari halaman detail, katalog tidak memicu reload dari awal.
3. **Skeleton Shimmer UI:**
   * Dilarang menggunakan indikator loading spinner layar penuh (*full-screen spinner*).
   * Gunakan animasi *pulse shimmer skeleton* berbentuk kartu kamar untuk mempertahankan persepsi responsivitas UI.
4. **Offline & Network Resiliency:**
   * Jika sambungan internet terputus di tengah proses booking, tampilkan banner mengambang di bawah: *"Koneksi terputus. Mencoba menghubungkan kembali..."* dengan tombol *Retry*.
   * Menggunakan idempotency key pada pemanggilan `POST /v1/bookings/commit` untuk mencegah penagihan ganda (*double charge*) jika pengguna mengetuk tombol bayar secara berulang.

---

## 9. Matriks Pengujian & Kriteria Penerimaan (Acceptance Criteria)

| Skenario Pengujian | Aksi Pengguna / Sistem | Hasil yang Diharapkan (Acceptance Criteria) |
| :--- | :--- | :--- |
| **Penerimaan Token SSO** | Masuk dari menu Alfa Teve dengan parameter token di URL | Halaman langsung terbuka dengan nama hotel & data profil user terisi tanpa layar login. |
| **Navigasi Back Button** | Menekan tombol back Android saat berada di detail kamar | Detail kamar tertutup, pengguna kembali melihat daftar kamar tanpa webview tertutup. |
| **Navigasi Back di Home** | Menekan tombol back Android pada layar katalog utama | Bridge mengirimkan sinyal `CLOSE_WEBVIEW`, aplikasi Alfa Teve kembali ke menu asal. |
| **Urgency Badge** | Kamar yang memiliki kuota $\le 3$ ditampilkan | Tampil badge oranye menyala "Sisa X Kamar Lagi!" di kartu kamar terkait. |
| **Lock Inventory (Hold)** | Pengguna masuk ke layar rincian pembayaran | Kuota kamar di backend langsung terpotong sementara; timer 15:00 mulai berhitung mundur. |
| **Timeout Pembayaran** | Timer mencapai 00:00 sebelum bayar | Sistem menampilkan pop-up: *"Waktu pemesanan habis"* dan mengarahkan kembali ke katalog. |
| **Deep Link E-Wallet** | Memilih GoPay / ShopeePay | Aplikasi perbankan yang bersangkutan terbuka langsung dari webview tanpa *blank screen*. |
| **Voucher Digital** | Pembayaran sukses terverifikasi | Halaman menampilkan Booking ID, kode QR check-in, dan tombol bagikan voucher ke WhatsApp. |
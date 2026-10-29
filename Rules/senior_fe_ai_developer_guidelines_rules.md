# Frontend Engineering & UI Slicing Governance Rules
## Senior Frontend / Software Engineer Standard Operating Procedures (SOP)

* **Document Target:** AI Code Assistant / Senior Frontend Engineer
* **Target Project:** Stayin Mobile Webview (Integrated with Alfa Teve & Hospitality Core)
* **Core Stack:** Next.js 15+ (App Router), TypeScript (Strict), Tailwind CSS, Lucide Icons, Zustand / TanStack Query
* **Design Benchmark:** Traveloka Mobile Experience (Primary: Blue & White, Secondary: Orange)
* **Version:** 1.0.0 (Production Standards)

---

## 1. Identitas & Pola Pikir (Persona & Engineering Mindset)

Anda adalah seorang **Staff / Senior Frontend Software Engineer** dan **UI/UX Slicing Specialist** kelas dunia. Anda tidak sekadar memindahkan visual desain ke dalam HTML/CSS mentah; Anda membangun sistem antarmuka webview yang tangguh, modular, berkinerja tinggi, dan mudah dirawat.

### Prinsip Utama yang Wajib Dipegang:
1. **Component-Driven Development:** Setiap elemen visual harus dipecah menjadi komponen modular terkecil yang dapat digunakan ulang (*reusable*).
2. **Strict Separation of Concerns (SoC):** Pisahkan dengan kaku antara *Presentational Component* (UI murni tanpa logic), *Container Component* (penghubung state/data), *Custom Hooks* (logika bisnis/interaksi), dan *API Services* (komunikasi data eksternal).
3. **Contract-First & Type-Safe:** Dilarang keras menggunakan tipe `any`. Semua struktur data request, response, dan UI props harus memiliki tipe data eksplisit (TypeScript `interface` / `type`).
4. **Resilient Webview UX:** Selalu asumsikan aplikasi berjalan di dalam *in-app browser* ponsel dengan keterbatasan memori, koneksi jaringan tidak stabil (3G/4G fluktuatif), dan potensi interupsi navigasi dari aplikasi host (Alfa Teve).

---

## 2. Standar Arsitektur Direktori Proyek

AI wajib mematuhi arsitektur folder modular berikut saat membuat atau memodifikasi berkas:

```text
src/
├── app/                          # Next.js App Router (Rute & Entry Point Layar)
│   ├── (booking)/                # Route Group untuk alur transaksi
│   │   ├── search/page.tsx
│   │   ├── rooms/page.tsx
│   │   ├── checkout/page.tsx
│   │   └── voucher/[id]/page.tsx
│   ├── layout.tsx                # Master Mobile Frame (< 480px) & SafeArea
│   ├── globals.css               # Tailwind directives & CSS Variables
│   └── error.tsx                 # Global Fallback Error Boundary
├── components/
│   ├── ui/                       # Base Primitives (Button, Input, Badge, Skeleton, Modal)
│   ├── common/                   # Shared Business Widgets (PriceBar, RatingTag, Countdown)
│   ├── modules/                  # Feature-Specific Components
│   │   ├── search/               # DatePickerSheet, GuestCounterModal
│   │   ├── room/                 # RoomCard, RoomCarousel, AmenityList
│   │   ├── checkout/             # PriceSummaryAccordion, GuestForm
│   │   └── voucher/              # QRCodeView, ActionButtons
│   └── layouts/                  # MobileHeader, StickyBottomBar, SafeAreaWrapper
├── hooks/                        # Custom React Hooks (useWebviewBridge, useCountdown, etc.)
├── services/                     # HTTP API Calls & Bridge Communicator
│   ├── api.client.ts             # Axios / Fetch instance dengan interceptor & timeout
│   ├── booking.service.ts        # Endpoint /v1/bookings
│   ├── room.service.ts           # Endpoint /v1/rooms
│   └── bridge.service.ts         # Window.postMessage & DeepLink Handler
├── stores/                       # Client Global State (Zustand)
│   ├── useBookingStore.ts        # Search query, selected room, form payload
│   └── useWebviewStore.ts        # Host tokens, tenant config, session
├── types/                        # TypeScript Definitions & API Contracts
│   ├── api.types.ts              # Generic response wrapper { success, data, error }
│   ├── booking.types.ts          # Reservation entities & hold payloads
│   ├── room.types.ts             # Room details, rates, availability
│   └── bridge.types.ts           # In-App Event Payloads
└── lib/                          # Utility Pure Functions (formatCurrency, dateUtils, cn)
```

---

## 3. Aturan Slicing & Desain Sistem (Design System Guidelines)

Setiap implementasi visual wajib mematuhi palet warna dan karakteristik rasa (*look and feel*) ala **Traveloka Mobile Web**:

### 3.1 Token Warna Wajib (Tailwind Config / Class Names)
* **Primary (Trust & Identity):**
  * Utama: `bg-[#0194F3]` / `text-[#0194F3]` (Brand Blue)
  * Dark/Hover: `bg-[#007CE8]`
  * Light Background: `bg-[#F2F9FF]` / `border-[#BEE4FD]`
* **Secondary / Action Accent (Conversion & Urgency):**
  * Utama: `bg-[#FF5E1F]` / `text-[#FF5E1F]` (Traveloka Orange CTA)
  * Hover: `bg-[#E54D12]`
  * Badge/Highlight: `bg-[#FFF0EB]` / `text-[#D93800]`
* **Neutral & Surface:**
  * Background Kanvas: `bg-[#F7F9FA]` (Meredam kelelahan mata pengguna)
  * Surface Card: `bg-white` dengan `border border-slate-100` atau `shadow-sm`
  * Text Heading: `text-slate-900` (`font-bold` / `font-semibold`)
  * Text Body & Subtitle: `text-slate-600` / `text-slate-400`
* **Success & Status:**
  * Sukses/Tersedia: `text-emerald-600` / `bg-emerald-50`

### 3.2 Karakteristik Slicing Mobile Webview
1. **Container Wrapper:** Seluruh tampilan desktop/tablet harus dibatasi dengan wrapper sentral seluler: `max-w-[480px] mx-auto min-h-screen bg-white relative shadow-2xl`.
2. **Ukuran Touch Target (Ergonomi Jempol):**
   * Semua tombol klik (`<button>`, `<a>`, dropdown item) wajib memiliki area klik minimal **$44\text{px} \times 44\text{px}$** (`min-h-[44px]`).
   * Hindari penempatan tombol kritis di area pojok atas yang sulit dijangkau satu tangan.
3. **Safe-Area Padding:**
   * Elemen tetap (*Fixed Bottom/Top*) wajib menyertakan utility class: `pb-[env(safe-area-inset-bottom,16px)]` dan `pt-[env(safe-area-inset-top,0px)]`.
4. **Shimmer Skeleton Over Full Screen Loaders:**
   * Dilarang menggunakan *spinner loading* layar penuh yang menghalangi konten.
   * Wajib menggunakan komponen `<Skeleton />` yang mereplikasi bentuk kartu kamar dan teks saat memuat data dari backend.
5. **No Clutter & Clear Visual Hierarchy:**
   * Harga akhir harus ditampilkan paling mencolok (*high-contrast*, oranye atau biru tebal).
   * Info sarapan (*Breakfast included*), sisa kuota kamar, dan kebijakan pembatalan wajib menggunakan icon badge kecil yang langsung terbaca sekilas.

---

## 4. Aturan Penulisan Komponen & Reusabilitas (Clean Code Rules)

AI developer harus menerapkan standar penulisan kode berikut tanpa kompromi:

### 4.1 Single Responsibility & Max Lines of Code
* Satu berkas komponen tidak boleh melebihi **150 baris kode**. Jika melebihi batas tersebut, pecah menjadi sub-komponen terpisah di dalam folder fitur yang sama.
* Jangan campur logika formulir yang rumit langsung di dalam elemen `<div>` perenderan. Gunakan *custom hooks* (misalnya: `useBookingForm.ts`).

### 4.2 Pattern Komponen yang Fleksibel (Compound & Variant Pattern)
Gunakan pustaka utility `clsx` dan `tailwind-merge` (fungsi `cn()`) untuk penggabungan style dinamis.

```typescript
// Contoh Standar Pembuatan Komponen Atom Reusable: src/components/ui/Button.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'action' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-[#0194F3] text-white hover:bg-[#007CE8]': variant === 'primary',
            'bg-[#FF5E1F] text-white hover:bg-[#E54D12] shadow-md shadow-orange-500/20': variant === 'action',
            'border-2 border-[#0194F3] text-[#0194F3] bg-transparent hover:bg-blue-50': variant === 'outline',
            'text-slate-600 hover:bg-slate-100': variant === 'ghost',
            'h-9 px-3 text-xs': size === 'sm',
            'h-11 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

---

## 5. Standar Integrasi API & State Management

### 5.1 Centralized Service Layer
* Dilarang memanggil `fetch()` atau `axios()` secara langsung di dalam komponen UI.
* Seluruh interaksi jaringan harus dibungkus dalam modul `services/*.service.ts`.
* Standardisasi penanganan respons backend:

```typescript
// src/types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
  };
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
```

### 5.2 Standar State Management (Zustand)
Gunakan Zustand untuk data transaksi yang melintasi beberapa halaman (*cross-page journey*):
* Sesi pencarian (Check-in, Check-out, Jumlah Tamu).
* Kamar yang sedang dipilih.
* Data profil tamu yang diisi otomatis dari token Alfa Teve.
* Sediakan aksi pembersihan (*reset store*) saat transaksi sukses atau dibatalkan.

---

## 6. Protokol Jembatan Webview (Native Bridge to Alfa Teve)

Karena aplikasi berjalan di dalam aplikasi seluler **Alfa Teve**, AI wajib mematuhi aturan komunikasi bridge:

### 6.1 Intersepsi Tombol Back Fisik Ponsel
Ketika user menekan tombol kembali di Android/iOS, jangan biarkan aplikasi Alfa Teve menutup Webview jika ada *modal/bottom-sheet* yang masih terbuka atau pengguna berada di langkah checkout:

```typescript
// Aturan dalam Hook: src/hooks/useWebviewBridge.ts
export const useWebviewBridge = () => {
  const sendToNative = (action: string, payload?: Record<string, unknown>) => {
    const message = JSON.stringify({ action, ...payload });
    
    // Android In-App Handler
    if (window.AndroidBridge && typeof window.AndroidBridge.postMessage === 'function') {
      window.AndroidBridge.postMessage(message);
      return;
    }
    
    // iOS WebKit Handler
    if (window.webkit?.messageHandlers?.AlfaTeveBridge) {
      window.webkit.messageHandlers.AlfaTeveBridge.postMessage(message);
      return;
    }

    // Fallback Window PostMessage
    window.parent.postMessage(message, '*');
  };

  return { sendToNative };
};
```

### 6.2 Deep-Linking Gateway Pembayaran
Ketika backend mengembalikan tautan pembayaran e-wallet/bank:
* Periksa apakah URL menggunakan skema deep-link khusus (`intent://`, `gojek://`, `shopeepay://`, `bca://`).
* Eksekusi melalui `window.location.href = redirectUrl` dengan aman tanpa merusak history stack webview.

---

## 7. Workflow Pengerjaan AI Developer (Step-by-Step Execution Protocol)

Setiap kali developer meminta pembuatan fitur, AI **WAJIB** mengikuti tahapan pengerjaan terstruktur berikut:

```
[Tahap 1: Kontrak Data & Tipe] ──> [Tahap 2: Slicing UI Komponen Atom]
                │
                ▼
[Tahap 3: Custom Hook & Logika State] ──> [Tahap 4: Integrasi Halaman & Bridge]
                │
                ▼
[Tahap 5: Self-Review & Verifikasi Edge Case]
```

1. **Tahap 1: Definisikan Types:**
   * Tulis `interface` untuk props komponen dan model data API terlebih dahulu di folder `types/`.
2. **Tahap 2: Slicing Komponen Presentasional:**
   * Bangun UI murni dengan Tailwind CSS. Pastikan ukuran responsif, warna primary biru dan aksen oranye terpasang presisi.
   * Sediakan *state mock* (Default, Loading Shimmer, Empty State, Error State).
3. **Tahap 3: Integrasikan State & Logic:**
   * Kaitkan komponen dengan custom hook atau store Zustand.
4. **Tahap 4: Pasang ke Route Page:**
   * Sambungkan ke App Router (`page.tsx`), atur metadata, dan pastikan layout mobile terbungkus dengan rapi.
5. **Tahap 5: Audit Mandiri (Self-Checklist):**
   * [ ] Apakah ada elemen yang terpotong notch/navigasi ponsel?
   * [ ] Apakah tombol penting mudah diklik jempol (tinggi $\ge 44\text{px}$)?
   * [ ] Apakah kontras warna tombol oranye `#FF5E1F` terbaca jelas dengan teks putih?
   * [ ] Apakah semua data dinamis sudah diformat (misal: `formatCurrency(1500000)` $\rightarrow$ `Rp 1.500.000`)?
   * [ ] Apakah tidak ada `console.log` dan TypeScript error yang tersisa?

---

## 8. Larangan Keras (Strict Constraints)

* ❌ **DILARANG** meng-hardcode teks harga atau tanggal tanpa fungsi utilitas pemformatan (`lib/formatters.ts`).
* ❌ **DILARANG** membuat halaman web dengan layout desktop melebar; batas maksimal lebar konten adalah **480px**.
* ❌ **DILARANG** menempatkan file API, store, tipe, dan komponen visual UI dalam satu file besar tunggal (*monolithic mess*).
* ❌ **DILARANG** menggunakan pustaka UI eksternal yang berat (seperti MUI atau Ant Design) yang dapat memperlambat rendering webview. Prioritaskan Tailwind CSS murni dan Radix UI Primitives / Headless UI yang ringan.
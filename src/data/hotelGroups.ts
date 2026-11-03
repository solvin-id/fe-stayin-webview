import { HOTELS } from '@/data/hotelCatalog';
import type { Hotel, HotelGroup, HotelGroupWithHotels } from '@/types/booking';

const heroOf = (hotelId: string): string =>
  HOTELS.find((listing) => listing.hotel.id === hotelId)?.hotel.heroImage ?? HOTELS[0].hotel.heroImage;

/**
 * Grup/management hotel yang tampil pada carousel beranda.
 * Nama, profil, dan layanan di bawah adalah data contoh untuk demo.
 */
export const HOTEL_GROUPS: HotelGroup[] = [
  {
    id: 'GRP-HORIZON',
    name: 'Horizon Hospitality',
    tagline: 'Hotel kota untuk perjalanan bisnis dan singgah singkat',
    description:
      'Jaringan hotel kota yang fokus pada lokasi strategis dan efisiensi layanan. Setiap properti dikelola dengan standar housekeeping dan resepsionis 24 jam yang sama.',
    established: 2009,
    headquarters: 'Surakarta',
    hotelIds: ['HTL-SOLO-01', 'HTL-SMG-01'],
    services: [
      'Resepsionis 24 jam',
      'Sarapan prasmanan',
      'Ruang rapat',
      'Antar-jemput bandara',
      'Parkir gratis',
    ],
    highlight: 'Lokasi di pusat kota dengan akses cepat ke area bisnis',
    heroImage: heroOf('HTL-SOLO-01'),
  },
  {
    id: 'GRP-HERITAGE',
    name: 'Nusantara Heritage Collection',
    tagline: 'Bangunan bersejarah dengan sentuhan budaya lokal',
    description:
      'Koleksi hotel yang menempati bangunan dan kawasan bersejarah. Fasad asli dipertahankan, interior diperbarui agar tetap nyaman untuk tamu modern.',
    established: 2014,
    headquarters: 'Surakarta',
    hotelIds: ['HTL-SOLO-03', 'HTL-YOG-01'],
    services: [
      'City tour budaya',
      'Restoran khas daerah',
      'Perpustakaan kecil',
      'Live gamelan akhir pekan',
      'Layanan concierge',
    ],
    highlight: 'Dekat kawasan cagar budaya Solo dan Malioboro',
    heroImage: heroOf('HTL-SOLO-03'),
  },
  {
    id: 'GRP-RETREAT',
    name: 'Java Retreat Resorts',
    tagline: 'Resort ketenangan dengan pemandangan alam',
    description:
      'Resort yang dirancang untuk menjauh sejenak dari kota: taman terbuka, kolam renang, dan program pagi hari seperti yoga serta sunrise tour.',
    established: 2017,
    headquarters: 'Yogyakarta',
    hotelIds: ['HTL-YOG-02', 'HTL-MGL-01'],
    services: [
      'Kolam renang outdoor',
      'Sunrise tour Borobudur',
      'Kelas yoga pagi',
      'Spa dan pijat tradisional',
      'Restoran taman',
    ],
    highlight: 'Pemandangan candi dan perbukitan langsung dari area hotel',
    heroImage: heroOf('HTL-YOG-02'),
  },
  {
    id: 'GRP-SMARTSTAY',
    name: 'Smart Stay Partners',
    tagline: 'Akomodasi ringkas dengan harga hemat',
    description:
      'Properti efisien untuk tamu yang mengutamakan kebersihan dan lokasi dibanding fasilitas tambahan. Cocok untuk perjalanan singkat dan anggaran terbatas.',
    established: 2011,
    headquarters: 'Surakarta',
    hotelIds: ['HTL-SOLO-02'],
    services: [
      'Check-in mandiri',
      'WiFi cepat',
      'Air minum gratis',
      'Laundry kilat',
      'Area parkir',
    ],
    highlight: 'Kamar ringkas yang baru direnovasi dengan harga bersaing',
    heroImage: heroOf('HTL-SOLO-02'),
  },
];

const resolveHotels = (hotelIds: string[]): Hotel[] =>
  hotelIds
    .map((id) => HOTELS.find((listing) => listing.hotel.id === id)?.hotel)
    .filter((hotel): hotel is Hotel => Boolean(hotel));

export const getHotelGroups = (): HotelGroupWithHotels[] =>
  HOTEL_GROUPS.map((group) => ({ ...group, hotels: resolveHotels(group.hotelIds) }));

export const getHotelGroupById = (groupId: string | null): HotelGroupWithHotels | undefined => {
  if (!groupId) {
    return undefined;
  }
  const group = HOTEL_GROUPS.find((item) => item.id === groupId);
  if (!group) {
    return undefined;
  }
  return { ...group, hotels: resolveHotels(group.hotelIds) };
};

export const getLowestRateInGroup = (group: HotelGroupWithHotels): number => {
  const rates = group.hotels.flatMap((hotel) =>
    HOTELS.find((listing) => listing.hotel.id === hotel.id)?.rooms.flatMap((room) =>
      room.packages.map((roomPackage) => roomPackage.pricePerNight)
    ) ?? []
  );
  return rates.length === 0 ? 0 : Math.min(...rates);
};
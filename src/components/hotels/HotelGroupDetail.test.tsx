import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getHotelGroupById } from '@/data/hotelGroups';
import { HotelGroupDetail } from './HotelGroupDetail';

const group = getHotelGroupById('GRP-HORIZON');

afterEach(cleanup);

describe('HotelGroupDetail', () => {
  if (!group) {
    throw new Error('grup contoh GRP-HORIZON harus tersedia');
  }

  it('menampilkan nama, profil, dan keunggulan grup', () => {
    render(<HotelGroupDetail group={group} onBack={() => undefined} onSelectHotel={() => undefined} />);

    expect(screen.getAllByText(group.name).length).toBeGreaterThan(0);
    expect(screen.getByText(group.description)).toBeTruthy();
    expect(screen.getByText(group.highlight)).toBeTruthy();
    expect(screen.getByText(String(group.established))).toBeTruthy();
    expect(screen.getByText(group.headquarters)).toBeTruthy();
  });

  it('menampilkan seluruh layanan grup', () => {
    render(<HotelGroupDetail group={group} onBack={() => undefined} onSelectHotel={() => undefined} />);

    group.services.forEach((service) => {
      expect(screen.getByText(service)).toBeTruthy();
    });
  });

  it('mendaftar semua hotel dalam grup beserta tombol lihat kamar', () => {
    render(<HotelGroupDetail group={group} onBack={() => undefined} onSelectHotel={() => undefined} />);

    expect(screen.getByRole('heading', { name: /Hotel dalam Grup/i })).toBeTruthy();
    group.hotels.forEach((hotel) => {
      expect(screen.getByText(hotel.name)).toBeTruthy();
    });
    expect(screen.getAllByRole('button', { name: /Lihat Kamar/i })).toHaveLength(
      group.hotels.length
    );
  });

  it('meneruskan id hotel saat tombol lihat kamar diklik', () => {
    const onSelectHotel = vi.fn();
    render(
      <HotelGroupDetail group={group} onBack={() => undefined} onSelectHotel={onSelectHotel} />
    );

    fireEvent.click(screen.getAllByRole('button', { name: /Lihat Kamar/i })[0]);
    expect(onSelectHotel).toHaveBeenCalledWith(group.hotels[0].id);
  });

  it('memanggil onBack saat tombol kembali ditekan', () => {
    const onBack = vi.fn();
    render(<HotelGroupDetail group={group} onBack={onBack} onSelectHotel={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: 'Kembali' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
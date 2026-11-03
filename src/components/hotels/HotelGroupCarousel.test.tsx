import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getHotelGroups } from '@/data/hotelGroups';
import { HotelGroupCarousel } from './HotelGroupCarousel';

const groups = getHotelGroups();

beforeEach(() => {
  // jsdom belum menyediakan matchMedia; carousel memakainya untuk prefers-reduced-motion.
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('HotelGroupCarousel', () => {
  it('memakai judul Rekomendasi Grup Hotel', () => {
    render(<HotelGroupCarousel groups={groups} onSelect={() => undefined} />);

    expect(screen.getByRole('heading', { name: 'Rekomendasi Grup Hotel' })).toBeTruthy();
  });

  it('menampilkan satu banner per grup', () => {
    render(<HotelGroupCarousel groups={groups} onSelect={() => undefined} />);

    const banners = screen.getAllByRole('button', { name: /Buka grup hotel/i });
    expect(banners).toHaveLength(groups.length);
  });

  it('menyebut nama grup dan jumlah hotel pada tiap banner', () => {
    render(<HotelGroupCarousel groups={groups} onSelect={() => undefined} />);

    groups.forEach((group) => {
      expect(screen.getByText(group.name)).toBeTruthy();
      expect(
        screen.getByRole('button', { name: `Buka grup hotel ${group.name}` }).textContent
      ).toContain(`${group.hotels.length} hotel`);
    });
  });

  it('memanggil onSelect dengan id grup yang ditekan', () => {
    const onSelect = vi.fn();
    render(<HotelGroupCarousel groups={groups} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: `Buka grup hotel ${groups[1].name}` }));

    expect(onSelect).toHaveBeenCalledWith(groups[1].id);
  });

  it('tidak merender apa pun bila daftar grup kosong', () => {
    const { container } = render(<HotelGroupCarousel groups={[]} onSelect={() => undefined} />);
    expect(container.childElementCount).toBe(0);
  });
});
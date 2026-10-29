'use client';

import { useEffect, useState } from 'react';

const BADGE_ID = 'nl-badge-frame';
const MAX_FRAME_WIDTH = 480;

const measureOffset = (): number => {
  const badge = document.getElementById(BADGE_ID);
  if (!badge) {
    return 0;
  }

  const badgeRect = badge.getBoundingClientRect();
  if (badgeRect.height === 0) {
    return 0;
  }

  const frameWidth = Math.min(window.innerWidth, MAX_FRAME_WIDTH);
  const frameLeft = (window.innerWidth - frameWidth) / 2;
  const frameRight = frameLeft + frameWidth;
  const overlaps = badgeRect.left < frameRight && badgeRect.right > frameLeft;

  return overlaps ? Math.round(badgeRect.height) : 0;
};

/**
 * Netlify menyuntik iframe badge "Powered by Netlify" di pojok kanan bawah dengan
 * z-index maksimum. Di layar ponsel badge itu menutupi tombol aksi, jadi elemen
 * fixed bawah perlu dinaikkan sebesar tinggi badge.
 */
export const useHostBottomOffset = (): number => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame = 0;

    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setOffset(measureOffset()));
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', sync);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  return offset;
};

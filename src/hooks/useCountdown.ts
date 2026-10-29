'use client';

import { useEffect, useRef, useState } from 'react';
import { formatCountdown } from '@/lib/formatters';

interface CountdownState {
  secondsLeft: number;
  isExpired: boolean;
  label: string;
}

export const useCountdown = (
  expiresAt: number | null,
  onExpire?: () => void
): CountdownState => {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const firedRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(0);
      return;
    }

    firedRef.current = false;

    const tick = () => {
      const next = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsLeft(next);
      if (next === 0 && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current?.();
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  return {
    secondsLeft,
    isExpired: expiresAt !== null && secondsLeft === 0,
    label: formatCountdown(secondsLeft),
  };
};

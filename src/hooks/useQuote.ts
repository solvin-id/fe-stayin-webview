'use client';

import { useEffect, useState } from 'react';
import { isNginepEnabled } from '@/lib/api/config';
import { getQuote, type IQuoteQuery } from '@/services/quote.service';
import type { IQuoteDto } from '@/types/api';

export type QuoteStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UseQuoteResult {
  quote: IQuoteDto | null;
  status: QuoteStatus;
  error: string | null;
  retry: () => void;
}

/**
 * Loads the server quote for one room + stay range. A quote failure is not fatal:
 * the checkout falls back to the local estimate and the booking is still guarded
 * by the server's own recompute inside the transaction.
 */
export const useQuote = (query: IQuoteQuery | null): UseQuoteResult => {
  const [quote, setQuote] = useState<IQuoteDto | null>(null);
  const [status, setStatus] = useState<QuoteStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const roomId = query?.roomId ?? '';
  const checkIn = query?.checkIn ?? '';
  const checkOut = query?.checkOut ?? '';
  const guests = query?.guests ?? 0;
  const promoCode = query?.promoCode ?? '';

  useEffect(() => {
    if (!isNginepEnabled() || !roomId || !checkIn || !checkOut || guests < 1) {
      setQuote(null);
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    setError(null);

    getQuote({ roomId, checkIn, checkOut, guests, ...(promoCode ? { promoCode } : {}) })
      .then((result) => {
        if (cancelled) {
          return;
        }
        setQuote(result);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setQuote(null);
        setStatus('error');
        setError('Rincian biaya belum dapat dihitung ulang.');
      });

    return () => {
      cancelled = true;
    };
  }, [roomId, checkIn, checkOut, guests, promoCode, nonce]);

  return {
    quote,
    status,
    error,
    retry: () => setNonce((value) => value + 1),
  };
};

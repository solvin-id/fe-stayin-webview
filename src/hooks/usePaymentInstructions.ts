'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isNginepEnabled } from '@/lib/api/config';
import { NginepApiError } from '@/lib/api/errors';
import { chargePayment, getPaymentInstructions } from '@/services/payment.service';
import type { IPaymentInstructionDto } from '@/types/api';
import type { PaymentMethodId } from '@/types/booking';

export type PaymentInstructionStatus = 'idle' | 'loading' | 'ready' | 'error';

const POLL_INTERVAL_MS = 5000;

interface UsePaymentInstructionsResult {
  instruction: IPaymentInstructionDto | null;
  status: PaymentInstructionStatus;
  error: string | null;
  charge: (method: PaymentMethodId) => void;
  retry: () => void;
}

/**
 * Owns the guest's payment instrument: charges Midtrans on demand, then polls the
 * server every five seconds until the transaction stops being pending. Waiting is
 * never automatic — Midtrans locks one transaction per booking code, so the method
 * has to be the guest's choice.
 */
export const usePaymentInstructions = (
  bookingId: string | null,
  code: string | null,
): UsePaymentInstructionsResult => {
  const [instruction, setInstruction] = useState<IPaymentInstructionDto | null>(null);
  const [status, setStatus] = useState<PaymentInstructionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const lastMethod = useRef<PaymentMethodId | null>(null);

  // A reload mid-payment must not hide an instrument that already exists.
  useEffect(() => {
    if (!isNginepEnabled() || !code) {
      return;
    }
    let cancelled = false;
    void getPaymentInstructions(code)
      .then((result) => {
        if (cancelled || !result) {
          return;
        }
        setInstruction(result);
        setStatus('ready');
      })
      .catch(() => {
        // 404 / gateway hiccup: the guest can still pick a method.
      });
    return () => {
      cancelled = true;
    };
  }, [code, nonce]);

  useEffect(() => {
    if (!code || !instruction || instruction.status !== 'pending') {
      return;
    }
    const timer = window.setInterval(() => {
      void getPaymentInstructions(code)
        .then((next) => {
          if (next && next.status !== 'pending') {
            setInstruction(next);
          }
        })
        .catch(() => {
          // Keep polling; a transient failure is not a status.
        });
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [code, instruction]);

  const charge = useCallback(
    (method: PaymentMethodId) => {
      if (!bookingId) {
        return;
      }
      lastMethod.current = method;
      setStatus('loading');
      setError(null);
      void chargePayment(bookingId, method)
        .then((result) => {
          if (!result) {
            setStatus('idle');
            return;
          }
          setInstruction(result);
          setStatus('ready');
        })
        .catch((cause: unknown) => {
          setStatus('error');
          setError(
            cause instanceof NginepApiError && cause.code === 'PAYMENT_GATEWAY_ERROR'
              ? 'Pembayaran sedang tidak tersedia. Coba lagi beberapa saat.'
              : cause instanceof NginepApiError
                ? cause.message
                : 'Gagal membuat nomor pembayaran. Coba lagi.'
          );
        });
    },
    [bookingId]
  );

  const retry = useCallback(() => {
    setError(null);
    if (lastMethod.current) {
      charge(lastMethod.current);
      return;
    }
    setStatus('idle');
    setNonce((value) => value + 1);
  }, [charge]);

  return { instruction, status, error, charge, retry };
};

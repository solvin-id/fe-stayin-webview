'use client';

import { TimerOff } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

interface PaymentExpiredDialogProps {
  open: boolean;
  onRestart: () => void;
}

export const PaymentExpiredDialog = ({ open, onRestart }: PaymentExpiredDialogProps) => (
  <BottomSheet open={open} onClose={onRestart} title="Waktu Pemesanan Habis" hideClose>
    <div className="flex flex-col items-center pb-2 pt-1 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-action-soft text-action">
        <TimerOff size={30} />
      </span>
      <p className="mt-3 text-[13px] font-semibold text-slate-900">
        Hold kamar 15 menit telah berakhir
      </p>
      <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
        Stok kamar dilepas kembali. Silakan pilih kamar dan lakukan pembayaran ulang.
      </p>
      <Button variant="action" size="lg" fullWidth className="mt-4" onClick={onRestart}>
        Kembali ke Katalog Kamar
      </Button>
    </div>
  </BottomSheet>
);

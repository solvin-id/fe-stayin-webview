import { Clock, TimerOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentCountdownBannerProps {
  label: string;
  expired: boolean;
}

export const PaymentCountdownBanner = ({ label, expired }: PaymentCountdownBannerProps) => (
  <div
    className={cn(
      'flex items-center gap-2 px-3.5 py-2.5 text-white',
      expired ? 'bg-slate-600' : 'bg-action'
    )}
  >
    {expired ? (
      <TimerOff size={18} className="shrink-0" />
    ) : (
      <Clock size={18} className="shrink-0" />
    )}
    <p className="text-[12px] font-semibold leading-tight">
      {expired ? (
        'Waktu pembayaran telah habis.'
      ) : (
        <>
          Selesaikan pembayaran dalam{' '}
          <span className="font-bold tabular-nums">{label}</span> untuk mengamankan kamar Anda.
        </>
      )}
    </p>
  </div>
);

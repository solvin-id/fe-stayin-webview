import { QRCodeSVG } from 'qrcode.react';
import { cn } from '@/lib/utils';

interface QrCodeProps {
  /** The payload to encode; null renders a skeleton while the server responds. */
  value: string | null;
  size?: number;
  className?: string;
  label?: string;
}

/** Scannable QR (real QRIS payload or booking code), never a simulated matrix. */
export const QrCode = ({ value, size = 128, className, label }: QrCodeProps) => {
  if (!value) {
    return (
      <div
        role="img"
        aria-label={label ?? 'Memuat kode QR'}
        className={cn('animate-pulse rounded-md bg-slate-200', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="M"
      marginSize={2}
      bgColor="#FFFFFF"
      fgColor="#0F172A"
      role="img"
      aria-label={label ?? 'Kode QR'}
      className={cn('rounded-md bg-white', className)}
    />
  );
};

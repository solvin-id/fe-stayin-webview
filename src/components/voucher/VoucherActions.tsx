'use client';

import { Download, MessageCircle, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { closeWebview } from '@/services/bridge.service';
import { buildWhatsAppUrl, downloadVoucherSummary } from '@/services/voucher.service';
import { useBookingStore } from '@/stores/useBookingStore';
import type { Booking } from '@/types/booking';

interface VoucherActionsProps {
  booking: Booking;
  paid?: boolean;
  methodLabel?: string | null;
}

export const VoucherActions = ({
  booking,
  paid = true,
  methodLabel = null,
}: VoucherActionsProps) => {
  const showToast = useBookingStore((state) => state.showToast);
  const startNewBooking = useBookingStore((state) => state.startNewBooking);

  const handleWhatsApp = () => {
    window.open(buildWhatsAppUrl(booking, paid, methodLabel), '_blank', 'noopener,noreferrer');
    showToast('Voucher dibuka di WhatsApp.', 'success');
  };

  const handleDownload = () => {
    downloadVoucherSummary(booking, paid, methodLabel);
    showToast('Ringkasan voucher diunduh.', 'success');
  };

  const handleSearchAgain = () => {
    startNewBooking();
    showToast('Kembali ke daftar hotel untuk pemesanan baru.', 'info');
  };

  const handleClose = () => {
    const target = closeWebview();
    if (target === 'browser') {
      showToast('Pratinjau browser: event close_webview dikirim ke parent.', 'info');
    }
  };

  return (
    <div className="space-y-2">
      <Button variant="whatsapp" size="lg" fullWidth onClick={handleWhatsApp}>
        <MessageCircle size={17} /> Kirim Voucher ke WhatsApp
      </Button>
      <Button variant="outline" size="lg" fullWidth onClick={handleDownload}>
        <Download size={17} /> Download Ringkasan
      </Button>
      <Button variant="primary" size="lg" fullWidth onClick={handleSearchAgain}>
        <Search size={17} /> Cari Hotel Lain
      </Button>
      <Button variant="ghost" size="lg" fullWidth onClick={handleClose}>
        <X size={17} /> Kembali ke Alfa Teve
      </Button>
    </div>
  );
};

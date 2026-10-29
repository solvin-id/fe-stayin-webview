import { formatDateShort } from '@/lib/formatters';

interface SelectedDateSummaryProps {
  checkIn: string;
  checkOut: string;
}

export const SelectedDateSummary = ({ checkIn, checkOut }: SelectedDateSummaryProps) => (
  <div className="grid grid-cols-2 gap-2 pb-3">
    <div className="rounded-xl border border-slate-200 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Check-in
      </p>
      <p className="text-[13px] font-bold text-slate-900">{formatDateShort(checkIn)}</p>
      <p className="text-[10px] text-slate-500">Mulai 14:00</p>
    </div>
    <div className="rounded-xl border border-slate-200 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Check-out
      </p>
      <p
        className={
          checkOut
            ? 'text-[13px] font-bold text-slate-900'
            : 'text-[13px] font-bold text-slate-400'
        }
      >
        {checkOut ? formatDateShort(checkOut) : 'Pilih tanggal'}
      </p>
      <p className="text-[10px] text-slate-500">Sebelum 12:00</p>
    </div>
  </div>
);
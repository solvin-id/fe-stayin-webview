import { formatDateShort } from '@/lib/formatters';

interface SelectedDateSummaryProps {
  checkIn: string;
  checkOut: string;
  /** Property check-in time; omitted when the screen has no property loaded. */
  checkInTime?: string;
  /** Property check-out time; omitted when the screen has no property loaded. */
  checkOutTime?: string;
}

export const SelectedDateSummary = ({
  checkIn,
  checkOut,
  checkInTime,
  checkOutTime,
}: SelectedDateSummaryProps) => (
  <div className="grid grid-cols-2 gap-2 pb-3">
    <div className="rounded-xl border border-slate-200 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        Check-in
      </p>
      <p className="text-[13px] font-bold text-slate-900">{formatDateShort(checkIn)}</p>
      {checkInTime ? (
        <p className="text-[10px] text-slate-500">Mulai {checkInTime}</p>
      ) : null}
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
      {checkOutTime ? (
        <p className="text-[10px] text-slate-500">Sebelum {checkOutTime}</p>
      ) : null}
    </div>
  </div>
);
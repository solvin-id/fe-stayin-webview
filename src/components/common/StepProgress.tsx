import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['Pilih Kamar', 'Data Tamu', 'Pembayaran', 'Voucher'];

export const StepProgress = ({ activeIndex }: { activeIndex: number }) => (
  <ol className="flex items-start bg-white px-4 py-2.5">
    {STEPS.map((label, index) => {
      const done = index < activeIndex;
      const active = index === activeIndex;
      return (
        <li key={label} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full items-center">
            <span
              className={cn(
                'h-[2px] flex-1',
                index === 0
                  ? 'bg-transparent'
                  : index <= activeIndex
                    ? 'bg-primary'
                    : 'bg-slate-200'
              )}
            />
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                done || active
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 text-slate-500',
                active && 'ring-4 ring-primary/15'
              )}
            >
              {done ? <Check size={13} /> : index + 1}
            </span>
            <span
              className={cn(
                'h-[2px] flex-1',
                index === STEPS.length - 1
                  ? 'bg-transparent'
                  : index < activeIndex
                    ? 'bg-primary'
                    : 'bg-slate-200'
              )}
            />
          </div>
          <span
            className={cn(
              'whitespace-nowrap text-[10px] font-semibold',
              done || active ? 'text-primary' : 'text-slate-400'
            )}
          >
            {label}
          </span>
        </li>
      );
    })}
  </ol>
);

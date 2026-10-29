'use client';

import { CreditCard, Lock } from 'lucide-react';
import type { PaymentMethodMeta } from '@/types/booking';

const inputClass =
  'w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15';

export const CreditCardPanel = ({ method }: { method: PaymentMethodMeta }) => (
  <section className="animate-fade-in rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
    <div className="flex items-center justify-between">
      <h2 className="text-[13px] font-bold text-slate-900">{method.name}</h2>
      <CreditCard size={18} className="text-primary" />
    </div>

    <div className="mt-2.5 space-y-2">
      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold text-slate-600">Nomor Kartu</span>
        <input inputMode="numeric" placeholder="4111 1111 1111 1111" className={inputClass} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-slate-600">
            Masa Berlaku
          </span>
          <input inputMode="numeric" placeholder="MM/YY" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-slate-600">CVV</span>
          <input type="password" inputMode="numeric" placeholder="123" className={inputClass} />
        </label>
      </div>
    </div>

    <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
      <Lock size={11} /> Simulasi. Jangan masukkan data kartu asli.
    </p>
  </section>
);

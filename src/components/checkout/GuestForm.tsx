'use client';

import { Mail, MessageSquare, Phone, User, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GuestDetails } from '@/types/booking';
import type { GuestFormErrors } from '@/lib/validation';

interface GuestFormProps {
  guest: GuestDetails;
  errors: GuestFormErrors;
  onChange: (patch: Partial<GuestDetails>) => void;
  /** True only when the host actually returned an identity for this launch. */
  sso: boolean;
}

const inputClass = (hasError: boolean): string =>
  cn(
    'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2',
    hasError
      ? 'border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-primary focus:ring-primary/15'
  );

export const GuestForm = ({ guest, errors, onChange, sso }: GuestFormProps) => (
  <section className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-card">
    <header className="mb-3 flex items-center justify-between">
      <div>
        <h2 className="text-[14px] font-bold text-slate-900">Data Pemesan</h2>
        <p className="text-[11px] text-slate-500">
          {sso
            ? 'Terisi otomatis dari akun Alfa Teve'
            : 'Sesuai identitas saat check-in'}
        </p>
      </div>
      {sso ? (
        <span className="rounded-md bg-primary-surface px-1.5 py-0.5 text-[10px] font-semibold text-primary-dark">
          SSO
        </span>
      ) : null}
    </header>

    <div className="space-y-3">
      <label className="block">
        <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
          <User size={12} /> Nama Lengkap
        </span>
        <input
          value={guest.fullName}
          onChange={(event) => onChange({ fullName: event.target.value })}
          placeholder="Nama sesuai identitas"
          className={inputClass(Boolean(errors.fullName))}
          autoComplete="name"
        />
        {errors.fullName ? (
          <span className="mt-1 block text-[11px] text-red-600">{errors.fullName}</span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
          <Mail size={12} /> Alamat Email
        </span>
        <input
          type="email"
          inputMode="email"
          value={guest.email}
          onChange={(event) => onChange({ email: event.target.value })}
          placeholder="nama@email.com"
          className={inputClass(Boolean(errors.email))}
          autoComplete="email"
        />
        {errors.email ? (
          <span className="mt-1 block text-[11px] text-red-600">{errors.email}</span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
          <Phone size={12} /> No. WhatsApp
        </span>
        <input
          type="tel"
          inputMode="tel"
          value={guest.phone}
          onChange={(event) => onChange({ phone: event.target.value })}
          placeholder="081234567890"
          className={inputClass(Boolean(errors.phone))}
          autoComplete="tel"
        />
        {errors.phone ? (
          <span className="mt-1 block text-[11px] text-red-600">{errors.phone}</span>
        ) : null}
      </label>

      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
            <UserRound size={14} className="text-slate-400" /> Saya memesan untuk orang lain
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={guest.bookingForOther}
            aria-label="Pesan untuk orang lain"
            onClick={() => onChange({ bookingForOther: !guest.bookingForOther })}
            className="flex h-11 w-12 shrink-0 items-center"
          >
            <span
              className={cn(
                'relative h-7 w-12 rounded-full transition-colors',
                guest.bookingForOther ? 'bg-action' : 'bg-slate-300'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all',
                  guest.bookingForOther ? 'left-[22px]' : 'left-0.5'
                )}
              />
            </span>
          </button>
        </div>

        {guest.bookingForOther ? (
          <label className="mt-2.5 block">
            <span className="mb-1 block text-[11px] font-semibold text-slate-600">
              Nama Tamu Menginap
            </span>
            <input
              value={guest.guestName}
              onChange={(event) => onChange({ guestName: event.target.value })}
              placeholder="Nama tamu yang akan check-in"
              className={inputClass(Boolean(errors.guestName))}
            />
            {errors.guestName ? (
              <span className="mt-1 block text-[11px] text-red-600">{errors.guestName}</span>
            ) : null}
          </label>
        ) : null}
      </div>

      <label className="block">
        <span className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-600">
          <MessageSquare size={12} /> Catatan untuk Hotel (opsional)
        </span>
        <textarea
          rows={2}
          maxLength={500}
          value={guest.notes}
          onChange={(event) => onChange({ notes: event.target.value })}
          placeholder="cth: tiba pukul 22.00, mohon kamar yang tenang"
          className={inputClass(false)}
        />
        <span className="mt-1 block text-right text-[10px] text-slate-400">
          {guest.notes.length}/500
        </span>
      </label>
    </div>
  </section>
);

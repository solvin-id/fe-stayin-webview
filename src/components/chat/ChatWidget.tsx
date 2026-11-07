'use client';

import { useEffect, useRef, useState } from 'react';
import { BarChart3, BedDouble, MessageCircle, Send, X } from 'lucide-react';
import { useChatWidget } from '@/hooks/useChatWidget';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type {
  IChatUiBlock,
  IChatUiChart,
  IChatUiRooms,
  IChatUiStage,
} from '@/services/chat.service';

const STAGES: Array<{ id: IChatUiStage['stage']; label: string }> = [
  { id: 'search', label: 'Cari' },
  { id: 'quote', label: 'Harga' },
  { id: 'hold', label: 'Tahan' },
  { id: 'confirmed', label: 'Selesai' },
];

const RoomCards = ({
  block,
  onPick,
}: {
  block: IChatUiRooms;
  onPick: (text: string) => void;
}) => (
  <div className="mt-1.5 space-y-1.5">
    {block.rooms.map((room) => (
      <div
        key={room.id}
        className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-2"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-surface text-primary">
          <BedDouble size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-bold text-slate-900">{room.name}</p>
          <p className="text-[10px] text-slate-500">
            {room.capacity ? `${room.capacity} tamu · ` : ''}
            {room.price ? formatCurrency(Number(room.price)) : 'Harga di halaman kamar'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onPick(`Saya mau pesan kamar ${room.name}`)}
          className="shrink-0 rounded-lg bg-primary px-2 py-1 text-[10px] font-bold text-white"
        >
          Pesan
        </button>
      </div>
    ))}
  </div>
);

const StageStepper = ({ block }: { block: IChatUiStage }) => {
  const active = STAGES.findIndex((stage) => stage.id === block.stage);
  return (
    <div className="mt-1.5 flex items-center gap-1">
      {STAGES.map((stage, index) => (
        <div key={stage.id} className="flex flex-1 items-center gap-1">
          <span
            className={cn(
              'flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold',
              index <= active ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
            )}
          >
            {index + 1}
          </span>
          <span
            className={cn(
              'text-[9px] font-semibold',
              index <= active ? 'text-primary' : 'text-slate-400'
            )}
          >
            {stage.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const BookingCard = ({
  block,
}: {
  block: Extract<IChatUiBlock, { type: 'booking' }>;
}) => (
  <div className="mt-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-2">
    <p className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
      Kode Booking
    </p>
    <p className="font-mono text-[13px] font-bold text-slate-900">{block.code}</p>
    <p className="mt-0.5 text-[10px] text-slate-600">
      {block.status}
      {block.total ? ` · ${formatCurrency(Number(block.total))}` : ''}
    </p>
    {block.holdExpiresAt ? (
      <p className="text-[9px] text-slate-500">
        Bayar sebelum {new Date(block.holdExpiresAt).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    ) : null}
  </div>
);

const ChartBlock = ({ block }: { block: IChatUiChart }) => {
  const max = Math.max(1, ...block.series.map((item) => item.value));
  return (
    <div className="mt-1.5 rounded-xl border border-slate-100 bg-white p-2">
      <p className="flex items-center gap-1 text-[10px] font-bold text-slate-800">
        <BarChart3 size={12} className="text-primary" /> {block.title}
      </p>
      <div className="mt-1.5 space-y-1">
        {block.series.slice(0, 8).map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="w-16 shrink-0 truncate text-[9px] text-slate-500">
              {item.label}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
              />
            </span>
            <span className="w-6 text-right text-[9px] font-semibold text-slate-700">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const UiBlocks = ({
  blocks,
  onPick,
}: {
  blocks: IChatUiBlock[];
  onPick: (text: string) => void;
}) => (
  <>
    {blocks.map((block, index) => {
      switch (block.type) {
        case 'stage':
          return <StageStepper key={`${block.type}-${index}`} block={block} />;
        case 'rooms':
          return <RoomCards key={`${block.type}-${index}`} block={block} onPick={onPick} />;
        case 'booking':
          return <BookingCard key={`${block.type}-${index}`} block={block} />;
        case 'chart':
          return <ChartBlock key={`${block.type}-${index}`} block={block} />;
        default:
          return null;
      }
    })}
  </>
);

const THINKING_STEPS = [
  'calling wizard',
  'summarizing result',
  'picking best action',
];

const QUICK_PROMPTS = [
  'Apa fasilitas hotel?',
  'Jam check-in berapa?',
  'Kamar apa yang tersedia?',
];

export const ChatWidget = () => {
  const { enabled, open, messages, thinking, error, unread, toggle, send } =
    useChatWidget();
  const [draft, setDraft] = useState('');
  const [thinkingStep, setThinkingStep] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ block: 'end' });
    }
  }, [open, messages.length, thinking]);

  useEffect(() => {
    if (!thinking) {
      setThinkingStep(0);
      return;
    }
    const timer = window.setInterval(
      () => setThinkingStep((step) => (step + 1) % THINKING_STEPS.length),
      1100,
    );
    return () => window.clearInterval(timer);
  }, [thinking]);

  if (!enabled) {
    return null;
  }

  const visible = messages.filter((message) => message.role !== 'system');

  return (
    // Anchored to the app's 480px column, not the browser window: on a wide screen
    // the panel never stretches past the phone frame the guest is looking at.
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-[480px] flex-col items-end px-3"
      style={{ paddingBottom: 'calc(1rem + var(--host-bottom-offset, 0px))' }}
    >
      {open ? (
        <section className="pointer-events-auto mb-2 flex max-h-[min(70vh,600px)] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl">
          <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-surface text-primary">
              <MessageCircle size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-slate-900">Tanya Stayin</p>
              <p className="text-[9px] text-slate-500">
                Asisten hotel · hanya soal kamar & reservasi
              </p>
            </div>
          </header>

          <div className="min-h-[120px] flex-1 space-y-2 overflow-y-auto p-2.5">
            {visible.length === 0 ? (
              <div className="rounded-xl bg-white p-2.5 text-[11px] text-slate-600 shadow-card">
                Halo! Saya bisa membantu soal kamar, harga, ketersediaan, dan reservasi
                hotel ini. Ada yang bisa dibantu?
              </div>
            ) : null}
            {visible.map((message) => {
              const mine = message.role === 'guest';
              return (
                <div
                  key={message.id}
                  className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-2.5 py-1.5 text-[11px] leading-relaxed',
                      mine
                        ? 'bg-primary text-white'
                        : 'bg-white text-slate-700 shadow-card'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {!mine && message.ui && message.ui.length > 0 ? (
                      <UiBlocks blocks={message.ui} onPick={(text) => void send(text)} />
                    ) : null}
                  </div>
                </div>
              );
            })}
            {thinking ? (
              <div
                className="flex justify-start"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 rounded-2xl bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-500 shadow-card">
                  <span className="flex items-center gap-0.5" aria-hidden="true">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                  </span>
                  <span>{THINKING_STEPS[thinkingStep]}…</span>
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          {error ? (
            <p className="px-3 pb-1 text-[10px] font-medium text-red-600">{error}</p>
          ) : null}

          <div className="flex gap-1 overflow-x-auto px-2.5 pb-1.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={thinking}
                onClick={() => void send(prompt)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-semibold text-slate-600 disabled:opacity-40"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            className="flex items-center gap-1.5 border-t border-slate-200 bg-white p-2"
            onSubmit={(event) => {
              event.preventDefault();
              const text = draft;
              setDraft('');
              void send(text);
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Tulis pertanyaan…"
              aria-label="Pesan chat"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-2.5 py-2 text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Kirim pesan"
              disabled={thinking || draft.trim().length === 0}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Tutup chat' : 'Chat dengan hotel'}
        className="pointer-events-auto relative flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        {!open && unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-action px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        ) : null}
      </button>
    </div>
  );
};

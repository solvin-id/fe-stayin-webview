'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isNginepEnabled } from '@/lib/api/config';
import {
  fetchChatMessages,
  sendChatMessage,
  type ChatPageContext,
  type IChatWidgetMessage,
} from '@/services/chat.service';
import { useBookingStore } from '@/stores/useBookingStore';

const ANON_KEY = 'stayin_chat_anon';
const POLL_MS = 3000;
const FAST_POLL_MS = 1200;

const STEP_PAGE: Record<number, string> = {
  1: 'hotels',
  2: 'rooms',
  3: 'room-detail',
  4: 'checkout',
  5: 'payment',
  6: 'voucher',
};

const createAnonId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `stayin-${crypto.randomUUID()}`;
  }
  return `stayin-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readAnonId = (): string => {
  try {
    const existing = window.localStorage.getItem(ANON_KEY);
    if (existing && existing.length >= 8) {
      return existing;
    }
    const created = createAnonId();
    window.localStorage.setItem(ANON_KEY, created);
    return created;
  } catch {
    return createAnonId();
  }
};

/** Page + booking-stage context the assistant needs to answer for this moment. */
export const buildChatContext = (): ChatPageContext => {
  const state = useBookingStore.getState();
  return {
    page: STEP_PAGE[state.step] ?? 'hotels',
    step: state.step,
    ...(state.selectedHotelId ? { hotelId: state.selectedHotelId } : {}),
    ...(state.selectedRoomId ? { roomId: state.selectedRoomId } : {}),
    ...(state.selectedPackageId ? { packageId: state.selectedPackageId } : {}),
    checkIn: state.search.checkIn,
    checkOut: state.search.checkOut,
    guests: state.search.guests,
  };
};

interface UseChatWidgetResult {
  enabled: boolean;
  open: boolean;
  messages: IChatWidgetMessage[];
  /** True from the moment a guest message is sent until its reply arrives. */
  thinking: boolean;
  error: string | null;
  unread: number;
  toggle: () => void;
  send: (text: string) => Promise<void>;
}

export const useChatWidget = (): UseChatWidgetResult => {
  const enabled = isNginepEnabled();
  const [anonId, setAnonId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<IChatWidgetMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const lastAssistantSeen = useRef(0);
  const assistantBaseline = useRef(0);

  useEffect(() => {
    setAnonId(readAnonId());
  }, []);

  useEffect(() => {
    if (!enabled || !anonId) {
      return;
    }
    let cancelled = false;
    const refresh = async () => {
      const conversation = await fetchChatMessages(anonId);
      if (cancelled || !conversation) {
        return;
      }
      setMessages(conversation.messages);
      const assistantCount = conversation.messages.filter(
        (message) => message.role === 'assistant' || message.role === 'staff',
      ).length;
      // A reply newer than the last guest message ends the thinking state.
      if (assistantCount > assistantBaseline.current) {
        setAwaitingReply(false);
      }
      if (open) {
        lastAssistantSeen.current = assistantCount;
        setUnread(0);
      } else {
        setUnread(Math.max(0, assistantCount - lastAssistantSeen.current));
      }
    };
    void refresh();
    // While waiting for the assistant, poll faster so the status is short-lived.
    const timer = window.setInterval(
      () => void refresh(),
      awaitingReply ? FAST_POLL_MS : POLL_MS,
    );
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, anonId, open, awaitingReply]);

  const toggle = useCallback(() => {
    setOpen((current) => {
      if (!current) {
        setUnread(0);
      }
      return !current;
    });
  }, []);

  useEffect(() => {
    if (!awaitingReply) {
      return;
    }
    // Never leave the guest staring at a status forever if the worker is down.
    const timeout = window.setTimeout(() => setAwaitingReply(false), 45_000);
    return () => window.clearTimeout(timeout);
  }, [awaitingReply]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!anonId || content.length === 0 || sending || awaitingReply) {
        return;
      }
      assistantBaseline.current = messages.filter(
        (message) => message.role === 'assistant' || message.role === 'staff',
      ).length;
      setAwaitingReply(true);
      setSending(true);
      setError(null);
      // Optimistic echo so the guest sees their message immediately.
      setMessages((current) => [
        ...current,
        {
          id: `local-${Date.now()}`,
          role: 'guest',
          content,
          createdAt: new Date().toISOString(),
        },
      ]);
      try {
        await sendChatMessage({ anonId, content, context: buildChatContext() });
        const conversation = await fetchChatMessages(anonId);
        if (conversation) {
          setMessages(conversation.messages);
        }
      } catch {
        setAwaitingReply(false);
        setError('Pesan belum terkirim. Coba lagi.');
      } finally {
        setSending(false);
      }
    },
    [anonId, sending, awaitingReply, messages]
  );

  return {
    enabled,
    open,
    messages,
    thinking: sending || awaitingReply,
    error,
    unread,
    toggle,
    send,
  };
};

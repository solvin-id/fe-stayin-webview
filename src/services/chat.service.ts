import { nginepFetch } from '@/lib/api/client';
import { isNginepEnabled } from '@/lib/api/config';
import { DEFAULT_TENANT } from '@/lib/api/config';

export interface IChatUiStage {
  type: 'stage';
  stage: 'search' | 'quote' | 'hold' | 'confirmed';
  label: string;
}

export interface IChatUiRooms {
  type: 'rooms';
  rooms: Array<{
    id: string;
    name: string;
    price: string | null;
    capacity: number | null;
  }>;
}

export interface IChatUiBooking {
  type: 'booking';
  code: string;
  status: string;
  holdExpiresAt: string | null;
  total: string | null;
}

export interface IChatUiChart {
  type: 'chart';
  title: string;
  series: Array<{ label: string; value: number }>;
}

export type IChatUiBlock =
  | IChatUiStage
  | IChatUiRooms
  | IChatUiBooking
  | IChatUiChart;

export interface IChatWidgetMessage {
  id: string;
  role: string;
  content: string;
  ui?: IChatUiBlock[];
  createdAt: string;
}

export interface IChatWidgetConversation {
  sessionId: string;
  status: string;
  messages: IChatWidgetMessage[];
}

export type ChatPageContext = Record<string, string | number | boolean>;

const widgetPath = (tenant: string): string =>
  `/chat/widget/${encodeURIComponent(tenant || DEFAULT_TENANT)}`;

/** The embeddable widget's transport; tenant comes from the build default. */
export const sendChatMessage = async (input: {
  anonId: string;
  content: string;
  context: ChatPageContext;
}): Promise<void> => {
  if (!isNginepEnabled()) {
    return;
  }
  await nginepFetch(`${widgetPath(DEFAULT_TENANT)}/messages`, {
    method: 'POST',
    body: {
      anonId: input.anonId,
      content: input.content,
      context: input.context,
    },
  });
};

/** Null until the guest has said anything (the widget starts empty). */
export const fetchChatMessages = async (
  anonId: string,
): Promise<IChatWidgetConversation | null> => {
  if (!isNginepEnabled()) {
    return null;
  }
  try {
    const payload = await nginepFetch<IChatWidgetConversation | null>(
      `${widgetPath(DEFAULT_TENANT)}/messages?anonId=${encodeURIComponent(anonId)}`,
    );
    // No session yet answers with an empty body, which the proxy surfaces as `{}`;
    // treat anything without a messages array as "nothing to show".
    return payload && Array.isArray(payload.messages) ? payload : null;
  } catch {
    // A 404 is the normal "no session yet" answer; never surface it as an error.
    return null;
  }
};

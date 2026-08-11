import type { ChatMessage, ChatPreset } from "@/components/chat/chat.types";
import { createId } from "@/lib/create-id";

export const NONE_USER = "none";

export const DEFAULT_GAP_MS = 1500;
export const MIN_GAP_MS = 200;
export const MAX_GAP_MS = 2000;
export const GAP_STEP_MS = 100;

/** Wait before the first message appears in playback / export. */
export const DEFAULT_FIRST_MESSAGE_DELAY_MS = 0;
export const MIN_FIRST_MESSAGE_DELAY_MS = 0;
export const MAX_FIRST_MESSAGE_DELAY_MS = 5000;

/** Hold after the last message before playback ends or export finishes. */
export const DEFAULT_COMPLETE_DELAY_MS = 2000;
export const MIN_COMPLETE_DELAY_MS = 0;
export const MAX_COMPLETE_DELAY_MS = 5000;

export const DELAY_STEP_MS = 100;

export type StudioMode = "notif" | "chat";

export interface ChatDraft {
  messages: ChatMessage[];
  title: string;
  /** Remembered "me" / self user for this chat. */
  activeUserId?: string;
}

export const createEmptyMessage = (): ChatMessage => ({
  content: "",
  id: `msg-${createId()}`,
  userId: "",
});

export const createEmptyPreset = (): ChatPreset => {
  const id = `chat-${createId()}`;
  return {
    fileName: "",
    id,
    messages: [],
    title: "New chat",
  };
};

export const formatGap = (ms: number): string => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
};

export const resolveDraft = (
  preset: ChatPreset | undefined,
  draftsByChatId: Record<string, ChatDraft>
): ChatDraft | undefined => {
  if (!preset) {
    return undefined;
  }
  return (
    draftsByChatId[preset.id] ?? {
      messages: preset.messages,
      title: preset.title,
    }
  );
};

export const resolveDisplayMessages = (
  messages: ChatMessage[],
  isPlaying: boolean,
  visibleCount: number
): ChatMessage[] => (isPlaying ? messages.slice(0, visibleCount) : messages);

export const resolveEntranceMessageId = (
  messages: ChatMessage[],
  isPlaying: boolean,
  visibleCount: number
): string | undefined =>
  isPlaying && visibleCount > 0 ? messages[visibleCount - 1]?.id : undefined;

export const reorderMessages = (
  messages: ChatMessage[],
  fromIndex: number,
  toIndex: number
): ChatMessage[] => {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= messages.length ||
    toIndex >= messages.length
  ) {
    return messages;
  }
  const next = [...messages];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const insertMessage = (
  messages: ChatMessage[],
  anchorId: string,
  position: "above" | "below"
): ChatMessage[] => {
  const index = messages.findIndex((message) => message.id === anchorId);
  if (index === -1) {
    return messages;
  }
  const insertAt = position === "above" ? index : index + 1;
  const next = [...messages];
  next.splice(insertAt, 0, createEmptyMessage());
  return next;
};

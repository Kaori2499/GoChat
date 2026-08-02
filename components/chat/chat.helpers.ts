import type { ChatMessage, ChatUser } from "./chat.types";

/** Strip trailing newlines from contentEditable / paste (keeps mid-text breaks). */
export const normalizeChatMessageContent = (value: string): string =>
  value.replaceAll("\r\n", "\n").replaceAll(/\n+$/gu, "");

export const getParticipantIds = (messages: ChatMessage[]): string[] => [
  ...new Set(messages.map((message) => message.userId)),
];

export const isGroupChat = (messages: ChatMessage[]): boolean =>
  getParticipantIds(messages).length >= 2;

const resolveChatMessagesScroller = (root: ParentNode): HTMLElement | null => {
  if (!(root instanceof HTMLElement)) {
    return root.querySelector<HTMLElement>("[data-slot='chat-messages']");
  }
  if (root.matches("[data-slot='chat-messages']")) {
    return root;
  }
  return (
    root.closest<HTMLElement>("[data-slot='chat-messages']") ??
    root.querySelector<HTMLElement>("[data-slot='chat-messages']")
  );
};

/**
 * Pin the conversation list to the bottom. Prefer this over `scrollIntoView`:
 * the studio phone uses CSS `scale()`, which makes `scrollIntoView` miss or
 * scroll the wrong ancestor. Always uses instant scrolling — CSS
 * `scroll-behavior: smooth` would leave export frames mid-animation.
 */
export const scrollChatMessagesToBottom = (root: ParentNode): void => {
  const scroller = resolveChatMessagesScroller(root);
  if (!scroller) {
    return;
  }
  const previousBehavior = scroller.style.scrollBehavior;
  scroller.style.scrollBehavior = "auto";
  scroller.scrollTop = scroller.scrollHeight;
  scroller.style.scrollBehavior = previousBehavior;
};

export const resolveWallpaperUrl = (
  usersById: Record<string, ChatUser>,
  selfUserId?: string,
  wallpaperUrl?: string
): string | undefined => {
  if (wallpaperUrl) {
    return wallpaperUrl;
  }

  if (!selfUserId) {
    return undefined;
  }

  return usersById[selfUserId]?.wallpaperUrl;
};

export const resolveHeaderUser = (
  messages: ChatMessage[],
  usersById: Record<string, ChatUser>,
  selfUserId?: string
): ChatUser | undefined => {
  const participantIds = getParticipantIds(messages);
  if (participantIds.length !== 1 && participantIds.length !== 2) {
    return undefined;
  }

  const otherId =
    participantIds.find((id) => id !== selfUserId) ?? participantIds[0];

  return usersById[otherId];
};

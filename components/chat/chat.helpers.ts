import type { ChatMessage, ChatUser } from "./chat.types";

export const getParticipantIds = (messages: ChatMessage[]): string[] => [
  ...new Set(messages.map((message) => message.userId)),
];

export const isGroupChat = (messages: ChatMessage[]): boolean =>
  getParticipantIds(messages).length >= 2;

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

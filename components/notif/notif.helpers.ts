import { resolveWallpaperUrl } from "@/components/chat/chat.helpers";
import type { ChatUser } from "@/components/chat/chat.types";

import type { NotifClockState, NotifItemData } from "./notif.types";

export const resolveNotifWallpaperUrl = (
  usersById: Record<string, ChatUser>,
  selfUserId?: string,
  wallpaperUrl?: string
): string | undefined =>
  resolveWallpaperUrl(usersById, selfUserId, wallpaperUrl);

export const resolveNotifSender = (
  item: NotifItemData,
  usersById: Record<string, ChatUser>
): ChatUser | undefined => usersById[item.message.userId];

export const formatLockTime = (date = new Date()): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const formatLockDatePart = (date = new Date()): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

export const formatLockWeekday = (date = new Date()): string =>
  date.toLocaleDateString("ja-JP", { weekday: "long" });

export const createNotifClockState = (date = new Date()): NotifClockState => ({
  datePart: formatLockDatePart(date),
  timeLabel: formatLockTime(date),
  weekday: formatLockWeekday(date),
});

export const DEFAULT_NOTIF_TIME_LABEL = "现在";

export const resolveNotifTimeLabel = (item: NotifItemData): string =>
  item.timeLabel?.trim() || DEFAULT_NOTIF_TIME_LABEL;

export const createEmptyNotification = (): NotifItemData => ({
  chatId: "",
  chatTitle: "New chat",
  id: `notif-${crypto.randomUUID()}`,
  message: {
    content: "",
    id: `msg-${crypto.randomUUID()}`,
    userId: "",
  },
  timeLabel: DEFAULT_NOTIF_TIME_LABEL,
});

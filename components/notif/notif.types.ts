import type { ComponentProps, RefObject } from "react";

import type { ChatUser } from "@/components/chat/chat.types";

export type { ChatMessage } from "@/components/chat/chat.types";

export interface NotifMessage {
  id: string;
  userId: string;
  content: string;
}

export interface NotifItemData {
  id: string;
  chatId: string;
  chatTitle: string;
  /** Relative/absolute time shown at top-right, e.g. 现在 */
  timeLabel?: string;
  message: NotifMessage;
}

export interface NotifPreset {
  id: string;
  notifications: NotifItemData[];
  fileName: string;
}

export interface NotifClockState {
  /** e.g. 7月17日 */
  datePart: string;
  /** e.g. 19:55 — drives status bar + large clock */
  timeLabel: string;
  /** e.g. 金曜日 */
  weekday: string;
}

export type NotifShellProps = ComponentProps<"div"> & {
  wallpaperUrl?: string;
  wallpaperOpacity?: number;
};

export type NotifBodyProps = ComponentProps<"div">;

export interface NotifHeaderProps {
  title?: string;
  onClose?: () => void;
  className?: string;
}

export interface NotifLockScreenProps {
  clock: NotifClockState;
  editable?: boolean;
  onClockChange?: (clock: NotifClockState) => void;
  className?: string;
}

export interface NotifItemStates {
  content: string;
  timeLabel: string;
  senderAvatarUrl?: string;
  senderName?: string;
  isUnassigned?: boolean;
}

export interface NotifItemActions {
  onContentChange?: (content: string) => void;
  onTimeLabelChange?: (timeLabel: string) => void;
  onDelete?: () => void;
  onInsertAbove?: () => void;
  onInsertBelow?: () => void;
  onUserChange?: (userId: string) => void;
}

export interface NotifItemProps {
  states: NotifItemStates;
  actions?: NotifItemActions;
  editable?: boolean;
  users?: ChatUser[];
  className?: string;
}

export interface NotifStackProps {
  notifications: NotifItemData[];
  usersById: Record<string, ChatUser>;
  editable?: boolean;
  onAddNotification?: () => void;
  onContentChange?: (notifId: string, content: string) => void;
  onTimeLabelChange?: (notifId: string, timeLabel: string) => void;
  onDeleteNotification?: (notifId: string) => void;
  onInsertNotification?: (
    anchorId: string,
    position: "above" | "below"
  ) => void;
  onUserChange?: (notifId: string, userId: string) => void;
  className?: string;
}

export interface NotifPreviewProps {
  notifications: NotifItemData[];
  usersById: Record<string, ChatUser>;
  clock: NotifClockState;
  selfUserId?: string;
  wallpaperUrl?: string;
  editable?: boolean;
  exportRootRef?: RefObject<HTMLDivElement | null>;
  onClockChange?: (clock: NotifClockState) => void;
  onAddNotification?: () => void;
  onClearNotifications?: () => void;
  onContentChange?: (notifId: string, content: string) => void;
  onTimeLabelChange?: (notifId: string, timeLabel: string) => void;
  onDeleteNotification?: (notifId: string) => void;
  onInsertNotification?: (
    anchorId: string,
    position: "above" | "below"
  ) => void;
  onUserChange?: (notifId: string, userId: string) => void;
  className?: string;
}

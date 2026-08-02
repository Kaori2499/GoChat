import type { ComponentProps, RefObject } from "react";

import type { LocalizedName } from "@/lib/user-names";

export type ChatMessageKind = "text" | "image";

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  /** Set after the user picks text or image for a new bubble. */
  kind?: ChatMessageKind;
  /** Present when `kind` is `"image"`. */
  imageUrl?: string;
  /** Display width in CSS px when `kind` is `"image"`. */
  imageWidth?: number;
}

export interface ChatUser {
  id: string;
  names: LocalizedName;
  /** Pet names this user uses for others, keyed by target user id. */
  aliases: Record<string, LocalizedName>;
  phoneCaseColor: string;
  avatarUrl: string;
  wallpaperUrl: string;
}

export interface ChatPreset {
  id: string;
  title: string;
  messages: ChatMessage[];
  fileName: string;
}

export type ChatThemeId = "light" | "dark";

export interface ChatThemeColors {
  background: string;
  surface: string;
  header: string;
  headerText: string;
  bubbleSent: string;
  bubbleSentText: string;
  bubbleReceived: string;
  bubbleReceivedText: string;
  input: string;
  inputText: string;
  accent: string;
  muted: string;
  icon: string;
  border: string;
}

export interface ChatTheme {
  id: ChatThemeId;
  name: string;
  colors: ChatThemeColors;
  pattern?: string;
}

export type ChatShellProps = ComponentProps<"div"> & {
  wallpaperUrl?: string;
  wallpaperOpacity?: number;
  theme?: ChatTheme;
};

export type ChatHeaderProps = ComponentProps<"div">;

export interface ChatTitleProps {
  title: string;
  isGroup?: boolean;
  editable?: boolean;
  onTitleChange?: (title: string) => void;
  className?: string;
}

export interface ChatHeaderAvatarProps {
  src?: string;
  name: string;
  className?: string;
}

export interface ChatHeaderGroupProps {
  title: string;
  editable?: boolean;
  onTitleChange?: (title: string) => void;
}

export type ChatBodyProps = ComponentProps<"div"> & {
  wallpaperUrl?: string;
  wallpaperOpacity?: number;
};

export type ChatFooterProps = ComponentProps<"div">;

export interface ChatMessageStates {
  id: string;
  content: string;
  kind?: ChatMessageKind;
  imageUrl?: string;
  imageWidth?: number;
  isOwn: boolean;
  isGroup: boolean;
  isConsecutiveFromSender?: boolean;
  /** False when this is the first message in the list (nothing above). */
  hasPrecedingMessage?: boolean;
  isUnassigned?: boolean;
  senderName?: string;
  senderAvatarUrl?: string;
}

export interface ChatMessageActions {
  onContentChange?: (content: string) => void;
  onChooseText?: () => void;
  onImageChange?: (imageUrl?: string) => void;
  onImageWidthChange?: (imageWidth: number) => void;
  onUserChange?: (userId: string) => void;
  onInsertAbove?: () => void;
  onInsertBelow?: () => void;
  onDelete?: () => void;
}

export interface ChatMessageProps {
  states: ChatMessageStates;
  actions?: ChatMessageActions;
  editable?: boolean;
  users?: ChatUser[];
  className?: string;
}

export interface ChatMessagesProps {
  messages: ChatMessage[];
  usersById: Record<string, ChatUser>;
  selfUserId?: string;
  editable?: boolean;
  /** Message id that should play the entrance slide-up animation. */
  entranceMessageId?: string;
  /** Entrance animation length in ms (scaled during slow video export). */
  entranceDurationMs?: number;
  onMessageContentChange?: (messageId: string, content: string) => void;
  onMessageChooseText?: (messageId: string) => void;
  onMessageImageChange?: (messageId: string, imageUrl?: string) => void;
  onMessageImageWidthChange?: (messageId: string, imageWidth: number) => void;
  onMessageUserChange?: (messageId: string, userId: string) => void;
  onInsertMessage?: (anchorId: string, position: "above" | "below") => void;
  onDeleteMessage?: (messageId: string) => void;
  onReorderMessage?: (fromIndex: number, toIndex: number) => void;
  onAddMessage?: () => void;
  className?: string;
}

export interface ChatPreviewProps {
  title: string;
  messages: ChatMessage[];
  usersById: Record<string, ChatUser>;
  selfUserId?: string;
  wallpaperUrl?: string;
  theme?: ChatTheme;
  editable?: boolean;
  entranceMessageId?: string;
  entranceDurationMs?: number;
  exportRootRef?: RefObject<HTMLDivElement | null>;
  onTitleChange?: (title: string) => void;
  onMessageContentChange?: (messageId: string, content: string) => void;
  onMessageChooseText?: (messageId: string) => void;
  onMessageImageChange?: (messageId: string, imageUrl?: string) => void;
  onMessageImageWidthChange?: (messageId: string, imageWidth: number) => void;
  onMessageUserChange?: (messageId: string, userId: string) => void;
  onInsertMessage?: (anchorId: string, position: "above" | "below") => void;
  onDeleteMessage?: (messageId: string) => void;
  onReorderMessage?: (fromIndex: number, toIndex: number) => void;
  onAddMessage?: () => void;
  className?: string;
}

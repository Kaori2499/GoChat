import { ChatBody, ChatFooter } from "./chat.body"
import {
  ChatHeader,
  ChatHeaderActions,
  ChatHeaderAvatar,
  ChatHeaderBack,
  ChatHeaderDirect,
  ChatHeaderGroup,
  ChatTitle,
} from "./chat.header"
import { ChatInput } from "./chat.input"
import { ChatMessage } from "./chat.message"
import { ChatMessages } from "./chat.messages"
import { ChatPreview } from "./chat.preview"
import { ChatShell } from "./chat.shell"

export type {
  ChatMessage as ChatMessageData,
  ChatMessageActions,
  ChatMessageProps,
  ChatMessageStates,
  ChatMessagesProps,
  ChatPreset,
  ChatPreviewProps,
  ChatShellProps,
  ChatTheme,
  ChatThemeId,
  ChatUser,
} from "./chat.types"

export { getChatTheme } from "./chat.theme"
export {
  getParticipantIds,
  isGroupChat,
  resolveHeaderUser,
  resolveWallpaperUrl,
} from "./chat.helpers"

export const Chat = Object.assign(ChatShell, {
  Body: ChatBody,
  Footer: ChatFooter,
  Header: ChatHeader,
  HeaderActions: ChatHeaderActions,
  HeaderAvatar: ChatHeaderAvatar,
  HeaderBack: ChatHeaderBack,
  HeaderDirect: ChatHeaderDirect,
  HeaderGroup: ChatHeaderGroup,
  Input: ChatInput,
  Message: ChatMessage,
  Messages: ChatMessages,
  Preview: ChatPreview,
  Title: ChatTitle,
})

"use client";

import { useTheme } from "next-themes";

import {
  IPHONE_HEIGHT,
  IPHONE_WIDTH,
  usePhonePreviewScale,
} from "@/hooks/use-phone-preview-scale";
import { cn } from "@/lib/utils";

import { ChatBody, ChatFooter } from "./chat.body";
import { ChatHeader, ChatHeaderGroup } from "./chat.header";
import { resolveWallpaperUrl } from "./chat.helpers";
import { ChatInput } from "./chat.input";
import { ChatMessages } from "./chat.messages";
import { ChatShell } from "./chat.shell";
import { getChatTheme } from "./chat.theme";
import type { ChatPreviewProps, ChatThemeId } from "./chat.types";

const ChatPreview = ({
  title,
  messages,
  usersById,
  selfUserId,
  wallpaperUrl,
  theme: themeProp,
  editable = true,
  entranceMessageId,
  entranceDurationMs,
  onTitleChange,
  onMessageContentChange,
  onMessageUserChange,
  onInsertMessage,
  onDeleteMessage,
  onReorderMessage,
  onAddMessage,
  exportRootRef,
  className,
}: ChatPreviewProps) => {
  const { resolvedTheme } = useTheme();
  const theme =
    themeProp ??
    getChatTheme((resolvedTheme === "dark" ? "dark" : "light") as ChatThemeId);
  const wallpaper = resolveWallpaperUrl(usersById, selfUserId, wallpaperUrl);
  const { height, scale, width } = usePhonePreviewScale();

  return (
    <div
      data-slot="chat-preview"
      className={cn("relative shrink-0", className)}
      style={{ height, width }}
    >
      <div
        className="origin-top-left"
        style={{
          height: IPHONE_HEIGHT,
          transform: `scale(${scale})`,
          width: IPHONE_WIDTH,
        }}
      >
        <ChatShell
          ref={exportRootRef}
          className="h-full w-full rounded-[47px] border border-black/10"
          theme={theme}
          wallpaperUrl={wallpaper}
        >
          <ChatHeader>
            <ChatHeaderGroup
              title={title}
              editable={editable}
              onTitleChange={onTitleChange}
            />
          </ChatHeader>
          <ChatBody>
            <ChatMessages
              messages={messages}
              usersById={usersById}
              selfUserId={selfUserId}
              editable={editable}
              entranceMessageId={entranceMessageId}
              entranceDurationMs={entranceDurationMs}
              onMessageContentChange={onMessageContentChange}
              onMessageUserChange={onMessageUserChange}
              onInsertMessage={onInsertMessage}
              onDeleteMessage={onDeleteMessage}
              onReorderMessage={onReorderMessage}
              onAddMessage={onAddMessage}
            />
          </ChatBody>
          <ChatFooter>
            <ChatInput />
          </ChatFooter>
        </ChatShell>
      </div>
    </div>
  );
};

ChatPreview.displayName = "Chat.Preview";

export { ChatPreview };

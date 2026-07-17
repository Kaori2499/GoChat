import { cn } from "@/lib/utils"

import { chatThemeStyle, getChatTheme } from "./chat.theme"
import type { ChatShellProps } from "./chat.types"

const ChatShell = ({
  className,
  style,
  theme = getChatTheme("light"),
  children,
  wallpaperUrl,
  wallpaperOpacity = 1,
  ...props
}: ChatShellProps) => {
  return (
    <div
      data-slot="chat"
      className={cn(
        "chat-surface relative isolate flex h-full w-full flex-col overflow-hidden",
        className,
      )}
      style={{
        ...chatThemeStyle(theme),
        backgroundColor: "var(--chat-bg)",
        ...style,
      }}
      {...props}
    >
      {wallpaperUrl ? (
        <img
          src={wallpaperUrl}
          alt=""
          className="chat-layer h-full w-full object-cover"
          style={{ opacity: wallpaperOpacity }}
          aria-hidden
        />
      ) : null}
      {children}
    </div>
  )
}

ChatShell.displayName = "Chat"

export { ChatShell }

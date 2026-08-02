import { cn } from "@/lib/utils";

import { chatThemeStyle, getChatTheme } from "./chat.theme";
import type { ChatShellProps } from "./chat.types";

const ChatShell = ({
  className,
  style,
  theme = getChatTheme("light"),
  children,
  wallpaperUrl,
  wallpaperOpacity = 1,
  ref,
  ...props
}: ChatShellProps) => (
  <div
    ref={ref}
    data-slot="chat"
    className={cn(
      "chat-surface relative isolate flex h-full w-full flex-col overflow-hidden",
      className
    )}
    style={{
      ...chatThemeStyle(theme),
      backgroundColor: "var(--chat-bg)",
      ...style,
    }}
    {...props}
  >
    {wallpaperUrl ? (
      // oxlint-disable-next-line next/no-img-element -- export capture needs plain img
      <img
        src={wallpaperUrl}
        alt=""
        className="chat-layer h-full w-full scale-105 object-cover blur-[2px]"
        style={{ opacity: wallpaperOpacity }}
        aria-hidden
      />
    ) : null}
    {children}
  </div>
);

ChatShell.displayName = "Chat";

export { ChatShell };

import { cn } from "@/lib/utils"

import type { ChatBodyProps, ChatFooterProps } from "./chat.types"

const ChatBody = ({
  className,
  children,
  wallpaperUrl: _wallpaperUrl,
  wallpaperOpacity: _wallpaperOpacity,
  ...props
}: ChatBodyProps) => {
  void _wallpaperUrl
  void _wallpaperOpacity

  return (
    <div
      data-slot="chat-body"
      className={cn("relative z-10 min-h-0 flex-1", className)}
      {...props}
    >
      {children}
    </div>
  )
}

ChatBody.displayName = "Chat.Body"

const ChatFooter = ({ className, children, ...props }: ChatFooterProps) => {
  return (
    <div
      data-slot="chat-footer"
      className={cn("relative z-20 shrink-0", className)}
      style={{ backgroundColor: "var(--chat-input)" }}
      {...props}
    >
      {children}
    </div>
  )
}

ChatFooter.displayName = "Chat.Footer"

export { ChatBody, ChatFooter }

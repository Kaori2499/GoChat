import { Camera, ImageIcon, Mic, Plus, Smile } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const iconClass = "h-6 w-6 text-[var(--chat-icon)]"
const iconButtonClass =
  "size-9 shrink-0 rounded-full p-0 text-[var(--chat-icon)] hover:bg-black/5 [&_svg:not([class*='size-'])]:size-6"

const ChatInput = ({ className }: { className?: string }) => {
  return (
    <div
      data-slot="chat-input"
      className={cn(
        "relative z-10 flex items-center gap-2 border-t border-[var(--chat-border)]/60 px-3 pt-2 pb-4",
        className,
      )}
      style={{ backgroundColor: "var(--chat-input)" }}
    >
      <Button type="button" variant="ghost" size="icon" className={iconButtonClass}>
        <Plus className={iconClass} />
      </Button>
      <Button type="button" variant="ghost" size="icon" className={iconButtonClass}>
        <Camera className={iconClass} />
      </Button>
      <Button type="button" variant="ghost" size="icon" className={iconButtonClass}>
        <ImageIcon className={iconClass} />
      </Button>
      <div
        className="flex min-h-9 flex-1 items-center justify-between gap-2 rounded-full border border-[var(--chat-border)] bg-white/80 px-3 py-1.5 text-[0.95rem] shadow-sm dark:bg-white/10"
        style={{ borderColor: "var(--chat-border)", color: "var(--chat-text)" }}
      >
        <span className="text-[var(--chat-muted)]">Aa</span>
        <Smile className={cn(iconClass, "shrink-0 text-[var(--chat-muted)]")} />
      </div>
      <Button type="button" variant="ghost" size="icon" className={iconButtonClass}>
        <Mic className={iconClass} />
      </Button>
    </div>
  )
}

ChatInput.displayName = "Chat.Input"

export { ChatInput }

"use client";

import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { MenuHistoryIcon, PhoneLinesIcon } from "./chat.icons";
import type {
  ChatHeaderAvatarProps,
  ChatHeaderGroupProps,
  ChatHeaderProps,
  ChatTitleProps,
} from "./chat.types";

const iconClass = "h-7 w-7 shrink-0 text-[var(--chat-icon)]";
const iconButtonClass =
  "size-10 shrink-0 rounded-full p-0 text-[var(--chat-icon)] opacity-100 hover:bg-black/5 [&_svg]:text-[var(--chat-icon)] [&_svg]:opacity-100 [&_svg:not([class*='size-'])]:size-7";

const actionIcons = [
  { Icon: PhoneLinesIcon, alt: "Phone" },
  { Icon: MenuHistoryIcon, alt: "More" },
] as const;

const ChatHeader = ({
  className,
  children,
  style,
  ...props
}: ChatHeaderProps) => (
  <div
    data-slot="chat-header"
    className={cn(
      "chat-header relative z-20 shrink-0 border-b border-white/15 backdrop-blur-md",
      className
    )}
    style={{
      backgroundColor:
        "color-mix(in srgb, var(--chat-header) 32%, transparent)",
      color: "var(--chat-header-text)",
      ...style,
    }}
    {...props}
  >
    <div className="flex min-h-12 items-center justify-between gap-4 px-3 py-1.5 pb-1">
      {children}
    </div>
  </div>
);

ChatHeader.displayName = "Chat.Header";

const ChatTitle = ({
  title,
  isGroup = false,
  editable = false,
  onTitleChange,
  className,
}: ChatTitleProps) => {
  const titleClassName = cn(
    "block truncate font-semibold leading-tight outline-none",
    isGroup && "text-center text-xl",
    editable && "cursor-text",
    className
  );

  if (editable) {
    return (
      <span
        data-slot="chat-title"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        role="textbox"
        aria-label="Edit chat name"
        tabIndex={0}
        className={titleClassName}
        onBlur={(event) => {
          const next = event.currentTarget.textContent?.trim() ?? "";
          if (next && next !== title) {
            onTitleChange?.(next);
          } else if (!next) {
            event.currentTarget.textContent = title;
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      >
        {title}
      </span>
    );
  }

  return (
    <span data-slot="chat-title" className={titleClassName}>
      {title}
    </span>
  );
};

ChatTitle.displayName = "Chat.Title";

const ChatHeaderAvatar = ({ src, name, className }: ChatHeaderAvatarProps) => {
  const fallback = name.slice(0, 2).toUpperCase();

  if (src) {
    return (
      <img
        data-slot="chat-header-avatar"
        src={src}
        alt={name}
        className={cn("h-9 w-9 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      data-slot="chat-header-avatar"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-white bg-[var(--chat-border)] text-[0.7rem] font-semibold",
        className
      )}
    >
      {fallback}
    </div>
  );
};

ChatHeaderAvatar.displayName = "Chat.HeaderAvatar";

const ChatHeaderBack = () => (
  <Button
    type="button"
    size="icon"
    variant="ghost"
    className={iconButtonClass}
    aria-label="Back"
  >
    <ChevronLeft className={iconClass} />
  </Button>
);

ChatHeaderBack.displayName = "Chat.HeaderBack";

const ChatHeaderActions = () => (
  <div
    data-slot="chat-header-actions"
    className="flex shrink-0 items-center gap-1"
  >
    {actionIcons.map(({ Icon, alt }) => (
      <Button
        key={alt}
        type="button"
        size="icon"
        variant="ghost"
        className={iconButtonClass}
        aria-label={alt}
      >
        <Icon className={iconClass} />
      </Button>
    ))}
  </div>
);

ChatHeaderActions.displayName = "Chat.HeaderActions";

const ChatHeaderGroup = ({
  title,
  editable = false,
  onTitleChange,
}: ChatHeaderGroupProps) => (
  <div className="relative flex w-full items-center justify-between">
    <div className="z-10 flex shrink-0 items-center">
      <ChatHeaderBack />
    </div>
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-20">
      <div className="pointer-events-auto min-w-0 max-w-full">
        <ChatTitle
          title={title}
          isGroup
          editable={editable}
          onTitleChange={onTitleChange}
        />
      </div>
    </div>
    <div className="z-10">
      <ChatHeaderActions />
    </div>
  </div>
);

ChatHeaderGroup.displayName = "Chat.HeaderGroup";

const ChatHeaderDirect = ({
  title,
  avatarUrl,
}: {
  title: string;
  avatarUrl?: string;
}) => (
  <>
    <div className="flex items-center gap-2">
      <ChatHeaderBack />
      <ChatHeaderAvatar src={avatarUrl} name={title} />
      <ChatTitle title={title} />
    </div>
    <ChatHeaderActions />
  </>
);

ChatHeaderDirect.displayName = "Chat.HeaderDirect";

export {
  ChatHeader,
  ChatHeaderActions,
  ChatHeaderAvatar,
  ChatHeaderBack,
  ChatHeaderDirect,
  ChatHeaderGroup,
  ChatTitle,
};

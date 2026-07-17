"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { CSSProperties } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { ChatMessageProps } from "./chat.types";

const senderNameClassName =
  "text-[0.8rem] font-semibold leading-tight text-black [paint-order:stroke_fill] [-webkit-text-stroke:1px_#fff]";

const bubbleTextClassName =
  "m-0 w-full min-w-[3ch] whitespace-pre-wrap break-words bg-transparent p-0 text-[0.95rem] font-medium leading-[1.5] outline-none empty:before:text-[var(--chat-muted)] empty:before:content-[attr(data-placeholder)]";

const avatarClassName =
  "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white";

const BubbleHorn = ({
  color,
  className,
}: {
  color: string;
  className?: string;
}) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 7C8.12296 11.2133 9.73833 14.4151 12 18L16 12C12.3508 10.7932 10.1109 9.36876 8 7Z"
        fill={color}
        stroke={color}
      />
    </svg>
  );
};

const ChatMessage = ({
  states,
  actions = {},
  editable = false,
  users = [],
  className,
}: ChatMessageProps) => {
  const {
    content,
    isOwn,
    isGroup,
    isConsecutiveFromSender = false,
    hasPrecedingMessage = true,
    isUnassigned = false,
    senderName,
    senderAvatarUrl,
  } = states;
  const {
    onContentChange,
    onUserChange,
    onInsertAbove,
    onInsertBelow,
    onDelete,
  } = actions;

  const avatarFallback = (senderName || "??").slice(0, 2).toUpperCase();
  const bubbleStyle: CSSProperties = {
    backgroundColor: isOwn ? "var(--bubble-sent)" : "var(--bubble-received)",
    color: isOwn ? "var(--bubble-sent-text)" : "var(--bubble-received-text)",
  };
  const hornColor = isOwn ? "var(--bubble-sent)" : "var(--bubble-received)";

  const avatarInner =
    !isUnassigned && senderAvatarUrl ? (
      <img
        src={senderAvatarUrl}
        alt={senderName || "Avatar"}
        className="h-full w-full object-cover"
        draggable={false}
      />
    ) : isUnassigned ? null : (
      <span className="text-[0.7rem] font-semibold text-[var(--chat-muted)]">
        {avatarFallback}
      </span>
    );

  const avatarShellClassName = cn(
    avatarClassName,
    isUnassigned
      ? "border-dashed border-white/80 bg-white/30"
      : "bg-[var(--chat-border)]",
    editable && "cursor-pointer",
  );

  const avatarNode = editable ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={avatarShellClassName}
        aria-label="Change user"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {avatarInner}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        className="w-auto min-w-44"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            className="gap-2"
            onClick={() => onUserChange?.(user.id)}
          >
            <img
              src={user.avatarUrl}
              alt=""
              className="size-6 rounded-full object-cover"
            />
            <span className="truncate">{user.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className={avatarShellClassName} aria-hidden={!senderName}>
      {avatarInner}
    </div>
  );

  const nameNode = isUnassigned ? (
    <span
      className={cn(
        senderNameClassName,
        "text-left text-[var(--chat-muted)] [-webkit-text-stroke:0]",
      )}
    >
      Select user
    </span>
  ) : (
    <span className={cn(senderNameClassName, "text-left")}>
      {senderName ?? "\u00A0"}
    </span>
  );

  const textNode = editable ? (
    <p
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Edit message"
      tabIndex={0}
      data-placeholder="Message"
      draggable={false}
      className={cn(bubbleTextClassName, "cursor-text")}
      onMouseDown={(event) => event.stopPropagation()}
      onBlur={(event) => {
        const next = event.currentTarget.textContent ?? "";
        if (next !== content) {
          onContentChange?.(next);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          event.currentTarget.blur();
        }
      }}
    >
      {content}
    </p>
  ) : (
    <p className={bubbleTextClassName}>{content || "\u00A0"}</p>
  );

  const bubbleContent = (
    <div className="relative w-fit max-w-full">
      <BubbleHorn
        color={hornColor}
        className={cn(
          "pointer-events-none absolute z-10 h-6 w-6",
          isOwn
            ? "right-[-8px] top-[-4px] translate-x-[2px] -translate-y-[2px] scale-x-[-1]"
            : "left-[-8px] top-[-4px] -translate-x-[2px] -translate-y-[2px]",
        )}
      />
      <div
        className="w-fit max-w-full rounded-[18px] px-3 py-1 text-[0.95rem] font-medium leading-[1.5] shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
        style={bubbleStyle}
      >
        {textNode}
      </div>
    </div>
  );

  const actionMenu = editable ? (
    <div
      className={cn(
        "absolute top-1/2 z-20 flex -translate-y-1/2 flex-row gap-0.5 opacity-0 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100",
        isOwn ? "right-full mr-1" : "left-full ml-1",
      )}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <Button
        type="button"
        size="icon-xs"
        variant="secondary"
        className="size-6 shadow-sm"
        aria-label="Insert message above"
        onClick={onInsertAbove}
      >
        <ArrowUp className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="icon-xs"
        variant="secondary"
        className="size-6 shadow-sm"
        aria-label="Insert message below"
        onClick={onInsertBelow}
      >
        <ArrowDown className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="icon-xs"
        variant="secondary"
        className="size-6 text-destructive shadow-sm"
        aria-label="Delete message"
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  ) : null;

  if (isOwn) {
    return (
      <div
        data-slot="chat-message"
        className={cn("group/message flex w-full justify-end", className)}
      >
        <div className="relative max-w-[80%] min-w-0">
          <div className="relative flex min-w-0 flex-col gap-0.5">
            {isGroup && hasPrecedingMessage && !isConsecutiveFromSender ? (
              <div
                className="invisible flex items-center gap-1 px-0.5"
                aria-hidden
              >
                <span className={senderNameClassName}>{"\u00A0"}</span>
              </div>
            ) : null}
            <div className="relative flex justify-end">
              <div className="relative max-w-full">
                {bubbleContent}
                {actionMenu}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="chat-message"
      className={cn("group/message flex w-full items-start gap-2", className)}
    >
      <div className="relative shrink-0">{avatarNode}</div>
      <div className="relative flex max-w-[68%] min-w-0 flex-col gap-0.5">
        <div className="relative flex items-center gap-1 px-0.5">{nameNode}</div>
        <div className="relative flex justify-start">
          <div className="relative max-w-full">
            {bubbleContent}
            {actionMenu}
          </div>
        </div>
      </div>
    </div>
  );
};

ChatMessage.displayName = "Chat.Message";

export { ChatMessage };

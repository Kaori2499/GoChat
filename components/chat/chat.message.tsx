"use client";

/* oxlint-disable complexity -- bubble layout + editable/image branches */
/* oxlint-disable next/no-img-element -- chat preview uses plain img for export capture */
/* oxlint-disable jsx-a11y/click-events-have-key-events -- image replace uses click + file input */
/* oxlint-disable jsx-a11y/no-static-element-interactions -- action chrome stops drag */
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions -- contentEditable caption */
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- contentEditable caption */
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Scaling,
  Trash2,
  Type,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  ChangeEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";

import {
  useDictionary,
  useLocale,
} from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { readImageFileAsDataUrl } from "@/lib/read-image-file";
import { resolveUserName } from "@/lib/user-names";
import { cn } from "@/lib/utils";

import {
  measureBubbleOuterWidth,
  syncBubblePretextLocale,
} from "./chat.bubble-shrinkwrap";
import { normalizeChatMessageContent } from "./chat.helpers";
import type {
  ChatMessageActions,
  ChatMessageKind,
  ChatMessageProps,
} from "./chat.types";

const EMPTY_ACTIONS: ChatMessageActions = {};
const EMPTY_USERS: NonNullable<ChatMessageProps["users"]> = [];

const IMAGE_MIN_WIDTH = 56;
const IMAGE_MAX_WIDTH = 280;

const clampImageWidth = (width: number): number =>
  Math.min(IMAGE_MAX_WIDTH, Math.max(IMAGE_MIN_WIDTH, Math.round(width)));

const ChatImageBubble = ({
  imageUrl,
  imageWidth,
  editable,
  fileInput,
  fileInputRef,
  replaceLabel,
  resizeLabel,
  onImageWidthChange,
}: {
  imageUrl: string;
  imageWidth?: number;
  editable: boolean;
  fileInput: ReactNode;
  fileInputRef: RefObject<HTMLInputElement | null>;
  replaceLabel: string;
  resizeLabel: string;
  onImageWidthChange?: (imageWidth: number) => void;
}) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const skipClickRef = useRef(false);
  const [draftWidth, setDraftWidth] = useState<number | null>(null);
  const displayWidth = draftWidth ?? imageWidth;

  const handleResizePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    if (!editable) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const rect = frame.getBoundingClientRect();
    const startWidth = frame.offsetWidth;
    const scaleX = rect.width / Math.max(startWidth, 1);
    const scaleY = rect.height / Math.max(frame.offsetHeight, 1);
    let latestWidth = startWidth;
    skipClickRef.current = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startClientX) / scaleX;
      const dy = (moveEvent.clientY - startClientY) / scaleY;
      const nextWidth = clampImageWidth(startWidth + (dx + dy) / 2);
      if (nextWidth !== latestWidth) {
        skipClickRef.current = true;
        latestWidth = nextWidth;
        setDraftWidth(nextWidth);
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      setDraftWidth(null);
      if (latestWidth !== startWidth) {
        onImageWidthChange?.(latestWidth);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  return (
    <div className="group/image relative w-fit max-w-full">
      {fileInput}
      <div
        ref={frameRef}
        className="relative w-fit max-w-full overflow-hidden rounded-[1.35rem] shadow-[0_1px_1px_rgba(0,0,0,0.06)] [corner-shape:squircle]"
        style={displayWidth ? { width: displayWidth } : undefined}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt=""
          aria-label={editable ? replaceLabel : undefined}
          className={cn(
            "block max-h-72 max-w-full bg-transparent object-contain",
            displayWidth ? "h-auto w-full" : undefined,
            editable && "cursor-pointer"
          )}
          draggable={false}
          onClick={() => {
            if (!editable) {
              return;
            }
            if (skipClickRef.current) {
              skipClickRef.current = false;
              return;
            }
            fileInputRef.current?.click();
          }}
        />
      </div>
      {editable ? (
        <button
          type="button"
          data-chat-image-resize=""
          className="absolute top-1 right-1 z-10 flex size-8 cursor-nwse-resize items-center justify-center rounded-full border border-white/80 bg-black/55 p-0 text-white opacity-0 shadow-sm transition-opacity group-hover/image:opacity-100 group-focus-within/image:opacity-100"
          aria-label={resizeLabel}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onPointerDown={handleResizePointerDown}
        >
          <Scaling className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
};

const senderNameClassName =
  "text-[0.8rem] font-semibold leading-tight text-black [paint-order:stroke_fill] [-webkit-text-stroke:1px_#fff]";

const bubbleTextClassName =
  "m-0 whitespace-pre-wrap break-words bg-transparent p-0 text-[0.95rem] font-medium leading-[1.5] outline-none empty:before:text-[var(--chat-muted)] empty:before:content-[attr(data-placeholder)] empty:inline-block empty:min-w-[3ch]";

const avatarClassName =
  "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white";

const BubbleHorn = ({
  color,
  className,
}: {
  color: string;
  className?: string;
}) => (
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

const ChatTextBubble = ({
  content,
  editable,
  isOwn,
  hornColor,
  bubbleStyle,
  placeholder,
  editLabel,
  onContentChange,
}: {
  content: string;
  editable: boolean;
  isOwn: boolean;
  hornColor: string;
  bubbleStyle: CSSProperties;
  placeholder: string;
  editLabel: string;
  onContentChange?: (content: string) => void;
}) => {
  const locale = useLocale();
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef<number | null>(null);
  const textContent = normalizeChatMessageContent(content);

  const applyWidth = (width: number | null) => {
    widthRef.current = width;
    const bubble = bubbleRef.current;
    if (!bubble) {
      return;
    }
    if (width === null) {
      bubble.style.removeProperty("width");
      return;
    }
    bubble.style.width = `${width}px`;
  };

  useLayoutEffect(() => {
    let cancelled = false;

    const applyMeasure = (text: string) => {
      if (cancelled) {
        return;
      }
      syncBubblePretextLocale(locale);
      applyWidth(measureBubbleOuterWidth(text, isOwn));
    };

    applyMeasure(textContent);

    const remeasureAfterFonts = async () => {
      await document.fonts.ready;
      applyMeasure(textContent);
    };
    void remeasureAfterFonts();

    return () => {
      cancelled = true;
    };
  }, [isOwn, locale, textContent]);

  // Re-apply after React commits so parent re-renders cannot clear the width.
  useLayoutEffect(() => {
    applyWidth(widthRef.current);
  });

  const textNode = editable ? (
    <p
      contentEditable
      suppressContentEditableWarning
      aria-label={editLabel}
      tabIndex={0}
      data-placeholder={placeholder}
      draggable={false}
      data-chat-bubble-text=""
      className={cn(bubbleTextClassName, "cursor-text")}
      onMouseDown={(event) => event.stopPropagation()}
      onInput={(event) => {
        syncBubblePretextLocale(locale);
        applyWidth(
          measureBubbleOuterWidth(event.currentTarget.textContent ?? "", isOwn)
        );
      }}
      onBlur={(event) => {
        const next = normalizeChatMessageContent(
          event.currentTarget.textContent ?? ""
        );
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
      {textContent}
    </p>
  ) : (
    <p data-chat-bubble-text="" className={bubbleTextClassName}>
      {textContent || "\u00A0"}
    </p>
  );

  return (
    <div className="relative max-w-full">
      <BubbleHorn
        color={hornColor}
        className={cn(
          "pointer-events-none absolute z-10 h-6 w-6",
          isOwn
            ? "right-[-8px] top-[-4px] translate-x-[2px] -translate-y-[2px] scale-x-[-1]"
            : "left-[-8px] top-[-4px] -translate-x-[2px] -translate-y-[2px]"
        )}
      />
      <div
        ref={bubbleRef}
        data-chat-bubble=""
        data-chat-own={isOwn ? "" : undefined}
        className="w-fit max-w-full rounded-[18px] px-3 py-1 text-[0.95rem] font-medium leading-[1.5] shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
        style={bubbleStyle}
      >
        {textNode}
      </div>
    </div>
  );
};

const resolveMessageMode = (input: {
  kind?: ChatMessageKind;
  content: string;
  imageUrl?: string;
}): "pending" | "text" | "image" => {
  if (input.kind === "text" || input.kind === "image") {
    return input.kind;
  }
  if (input.imageUrl) {
    return "image";
  }
  if (input.content) {
    return "text";
  }
  return "pending";
};

const resolveAvatarInner = (
  isUnassigned: boolean,
  senderAvatarUrl: string | undefined,
  senderName: string | undefined
) => {
  if (isUnassigned) {
    return null;
  }
  if (senderAvatarUrl) {
    return (
      <img
        src={senderAvatarUrl}
        alt={senderName || "Avatar"}
        className="h-full w-full object-cover"
        draggable={false}
      />
    );
  }
  return (
    <span className="text-[0.7rem] font-semibold text-[var(--chat-muted)]">
      {(senderName || "??").slice(0, 2).toUpperCase()}
    </span>
  );
};

const ChatMessage = ({
  states,
  actions = EMPTY_ACTIONS,
  editable = false,
  users = EMPTY_USERS,
  className,
}: ChatMessageProps) => {
  const dict = useDictionary();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    content,
    kind,
    imageUrl,
    imageWidth,
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
    onChooseText,
    onImageChange,
    onImageWidthChange,
    onUserChange,
    onInsertAbove,
    onInsertBelow,
    onDelete,
  } = actions;

  const mode = resolveMessageMode({ content, imageUrl, kind });
  const bubbleStyle: CSSProperties = {
    backgroundColor: isOwn ? "var(--bubble-sent)" : "var(--bubble-received)",
    color: isOwn ? "var(--bubble-sent-text)" : "var(--bubble-received-text)",
  };
  const hornColor = isOwn ? "var(--bubble-sent)" : "var(--bubble-received)";

  const handleImagePick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onImageChange?.(dataUrl);
    } catch {
      // Ignore invalid/unreadable files.
    }
  };

  const avatarInner = resolveAvatarInner(
    isUnassigned,
    senderAvatarUrl,
    senderName
  );

  const avatarShellClassName = cn(
    avatarClassName,
    isUnassigned
      ? "border-dashed border-white/80 bg-white/30"
      : "bg-[var(--chat-border)]",
    editable && "cursor-pointer"
  );

  const avatarNode = editable ? (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={avatarShellClassName}
        aria-label={dict.chat.changeUser}
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
            <span className="truncate">{resolveUserName(user, locale)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className={avatarShellClassName} aria-hidden={!senderName}>
      {avatarInner}
    </div>
  );

  let nameNode = (
    <span className={cn(senderNameClassName, "text-left")}>
      {senderName ?? "\u00A0"}
    </span>
  );
  if (isUnassigned) {
    nameNode = (
      <span
        className={cn(
          senderNameClassName,
          "text-left text-[var(--chat-muted)] [-webkit-text-stroke:0]"
        )}
      >
        {dict.chat.selectUser}
      </span>
    );
  }

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(event) => {
        void handleImagePick(event);
      }}
    />
  );

  let bodyNode: ReactNode = null;
  if (mode === "pending" && editable) {
    bodyNode = (
      <div
        className="flex w-fit items-center gap-1 rounded-[18px] border border-dashed border-white/50 bg-black/25 px-2 py-1.5 shadow-[0_1px_1px_rgba(0,0,0,0.06)] backdrop-blur-sm"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {fileInput}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-7 gap-1 px-2 text-xs"
          onClick={onChooseText}
        >
          <Type className="size-3.5" />
          {dict.chat.typeText}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="size-3.5" />
          {dict.chat.typeImage}
        </Button>
      </div>
    );
  } else if (mode === "image" && imageUrl) {
    bodyNode = (
      <ChatImageBubble
        imageUrl={imageUrl}
        imageWidth={imageWidth}
        editable={editable}
        fileInput={fileInput}
        fileInputRef={fileInputRef}
        replaceLabel={dict.chat.replaceImage}
        resizeLabel={dict.chat.resizeImage}
        onImageWidthChange={onImageWidthChange}
      />
    );
  } else {
    bodyNode = (
      <ChatTextBubble
        content={content}
        editable={editable}
        isOwn={isOwn}
        hornColor={hornColor}
        bubbleStyle={bubbleStyle}
        placeholder={dict.chat.messagePlaceholder}
        editLabel={dict.chat.editMessage}
        onContentChange={onContentChange}
      />
    );
  }

  const actionMenu = editable ? (
    <div
      className={cn(
        "absolute top-1/2 z-20 flex -translate-y-1/2 flex-row gap-0.5 opacity-0 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100",
        isOwn ? "right-full mr-1" : "left-full ml-1"
      )}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <Button
        type="button"
        size="icon-xs"
        variant="secondary"
        className="size-6 shadow-sm"
        aria-label={dict.chat.insertAbove}
        onClick={onInsertAbove}
      >
        <ArrowUp className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="icon-xs"
        variant="secondary"
        className="size-6 shadow-sm"
        aria-label={dict.chat.insertBelow}
        onClick={onInsertBelow}
      >
        <ArrowDown className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="icon-xs"
        variant="secondary"
        className="size-6 text-destructive shadow-sm"
        aria-label={dict.chat.delete}
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
        <div className="relative max-w-[80%]">
          <div className="relative flex max-w-full flex-col gap-0.5">
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
                {bodyNode}
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
      <div className="relative max-w-[68%] min-w-0">
        <div className="relative flex flex-col gap-0.5">
          <div className="relative flex items-center gap-1 px-0.5">
            {nameNode}
          </div>
          <div className="relative flex justify-start">
            <div className="relative max-w-full">
              {bodyNode}
              {actionMenu}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ChatMessage.displayName = "Chat.Message";

export { ChatMessage };

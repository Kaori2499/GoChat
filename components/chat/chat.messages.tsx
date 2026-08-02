"use client";

/* oxlint-disable complexity -- message row drag/drop + entrance flags */
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { DragEvent, RefObject } from "react";

import {
  useDictionary,
  useLocale,
} from "@/components/i18n/dictionary-provider";
import type { Locale } from "@/lib/i18n/config";
import { resolveDisplayName } from "@/lib/user-names";
import { cn } from "@/lib/utils";

import { isGroupChat, scrollChatMessagesToBottom } from "./chat.helpers";
import { ChatMessage } from "./chat.message";
import type {
  ChatMessage as ChatMessageData,
  ChatUser,
  ChatMessagesProps,
} from "./chat.types";

const DATE_LABEL = "今日";
const DRAG_TYPE = "application/x-gochat-message-index";
const DEFAULT_ENTRANCE_MS = 300;

const dateLabelClassName =
  "mx-auto w-fit rounded-full px-3 py-1 text-center text-xs font-semibold text-white shadow-[0_1px_4px_rgba(0,0,0,0.35)] backdrop-blur-md";

const dateLabelStyle = {
  WebkitBackdropFilter: "blur(10px) saturate(1.2)",
  backdropFilter: "blur(10px) saturate(1.2)",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  textShadow: "0 1px 2px rgba(0, 0, 0, 0.65)",
} as const;

const resolveInsertAt = (
  index: number,
  clientY: number,
  bounds: DOMRect
): number => (clientY < bounds.top + bounds.height / 2 ? index : index + 1);

const applyMessageReorderDrop = ({
  event,
  index,
  messageCount,
  onReorderMessage,
  setDragIndex,
  setInsertAt,
}: {
  event: DragEvent<HTMLDivElement>;
  index: number;
  messageCount: number;
  onReorderMessage?: (fromIndex: number, toIndex: number) => void;
  setDragIndex: (index: number | null) => void;
  setInsertAt: (index: number | null) => void;
}) => {
  event.preventDefault();
  const fromRaw = event.dataTransfer.getData(DRAG_TYPE);
  const fromIndex = Number(fromRaw);
  const bounds = event.currentTarget.getBoundingClientRect();
  let toIndex = resolveInsertAt(index, event.clientY, bounds);
  const isInvalid =
    Number.isNaN(fromIndex) || fromIndex < 0 || fromIndex >= messageCount;
  if (isInvalid) {
    setDragIndex(null);
    setInsertAt(null);
    return;
  }
  if (fromIndex < toIndex) {
    toIndex -= 1;
  }
  if (fromIndex !== toIndex) {
    onReorderMessage?.(fromIndex, toIndex);
  }
  setDragIndex(null);
  setInsertAt(null);
};

interface ChatMessageRowProps {
  message: ChatMessageData;
  index: number;
  messageCount: number;
  previousUserId?: string;
  usersById: Record<string, ChatUser>;
  users: ChatUser[];
  viewer: ChatUser | undefined;
  selfUserId?: string;
  editable: boolean;
  showNameSpacer: boolean;
  entranceMessageId?: string;
  entranceDurationMs: number;
  entranceRef: RefObject<HTMLDivElement | null>;
  dragIndex: number | null;
  insertAt: number | null;
  showInsertLine: boolean;
  locale: Locale;
  setDragIndex: (index: number | null) => void;
  setInsertAt: (index: number | null) => void;
  onMessageContentChange?: (messageId: string, content: string) => void;
  onMessageChooseText?: (messageId: string) => void;
  onMessageImageChange?: (messageId: string, imageUrl?: string) => void;
  onMessageImageWidthChange?: (messageId: string, imageWidth: number) => void;
  onMessageUserChange?: (messageId: string, userId: string) => void;
  onInsertMessage?: (anchorId: string, position: "above" | "below") => void;
  onDeleteMessage?: (messageId: string) => void;
  onReorderMessage?: (fromIndex: number, toIndex: number) => void;
}

const ChatMessageRow = ({
  message,
  index,
  messageCount,
  previousUserId,
  usersById,
  users,
  viewer,
  selfUserId,
  editable,
  showNameSpacer,
  entranceMessageId,
  entranceDurationMs,
  entranceRef,
  dragIndex,
  insertAt,
  showInsertLine,
  locale,
  setDragIndex,
  setInsertAt,
  onMessageContentChange,
  onMessageChooseText,
  onMessageImageChange,
  onMessageImageWidthChange,
  onMessageUserChange,
  onInsertMessage,
  onDeleteMessage,
  onReorderMessage,
}: ChatMessageRowProps) => {
  const isUnassigned = !message.userId;
  const sender = usersById[message.userId];
  const isOwn =
    !isUnassigned && Boolean(selfUserId) && message.userId === selfUserId;
  const isConsecutiveFromSender = previousUserId === message.userId;
  const useCompactSpacing = isOwn && isConsecutiveFromSender;
  const isEntrance = message.id === entranceMessageId;
  const showLineHere =
    showInsertLine &&
    (insertAt === index ||
      (insertAt === messageCount && index === messageCount - 1));
  const lineAtBottom = showLineHere && insertAt === messageCount;

  return (
    <div
      data-entrance-message={isEntrance ? "" : undefined}
      ref={isEntrance ? entranceRef : undefined}
      className={cn(
        "relative",
        isEntrance && "animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
      )}
      style={
        isEntrance
          ? { animationDuration: `${entranceDurationMs}ms` }
          : undefined
      }
    >
      {showLineHere && !lineAtBottom ? (
        <div
          className="pointer-events-none absolute top-0 right-0 left-0 z-20 h-0.5 -translate-y-1/2 rounded-full bg-[var(--chat-accent)]"
          aria-hidden
        />
      ) : null}
      <div
        draggable={editable}
        className={cn(
          "scroll-mb-4",
          !useCompactSpacing && "space-y-3",
          editable && "cursor-grab active:cursor-grabbing"
        )}
        onDragStart={(event) => {
          if (!editable) {
            return;
          }
          if (
            event.target instanceof Element &&
            event.target.closest("[data-chat-image-resize]")
          ) {
            event.preventDefault();
            return;
          }
          setDragIndex(index);
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData(DRAG_TYPE, String(index));
        }}
        onDragOver={(event) => {
          if (!editable || dragIndex === null) {
            return;
          }
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          const bounds = event.currentTarget.getBoundingClientRect();
          setInsertAt(resolveInsertAt(index, event.clientY, bounds));
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setInsertAt(null);
          }
        }}
        onDrop={(event) => {
          applyMessageReorderDrop({
            event,
            index,
            messageCount,
            onReorderMessage,
            setDragIndex,
            setInsertAt,
          });
        }}
        onDragEnd={() => {
          setDragIndex(null);
          setInsertAt(null);
        }}
      >
        <div className={cn(useCompactSpacing ? "" : "space-y-3")}>
          {index === 0 ? (
            <div className="flex justify-center">
              <span className={dateLabelClassName} style={dateLabelStyle}>
                {DATE_LABEL}
              </span>
            </div>
          ) : null}
          <ChatMessage
            editable={editable}
            users={users}
            states={{
              content: message.content,
              hasPrecedingMessage: index > 0,
              id: message.id,
              imageUrl: message.imageUrl,
              imageWidth: message.imageWidth,
              isConsecutiveFromSender,
              isGroup: showNameSpacer || isUnassigned || editable,
              isOwn,
              isUnassigned,
              kind: message.kind,
              senderAvatarUrl: sender?.avatarUrl,
              senderName: sender
                ? resolveDisplayName(viewer, sender, locale)
                : undefined,
            }}
            actions={{
              onChooseText: () => {
                onMessageChooseText?.(message.id);
              },
              onContentChange: (content) => {
                onMessageContentChange?.(message.id, content);
              },
              onDelete: () => {
                onDeleteMessage?.(message.id);
              },
              onImageChange: (imageUrl) => {
                onMessageImageChange?.(message.id, imageUrl);
              },
              onImageWidthChange: (nextWidth) => {
                onMessageImageWidthChange?.(message.id, nextWidth);
              },
              onInsertAbove: () => {
                onInsertMessage?.(message.id, "above");
              },
              onInsertBelow: () => {
                onInsertMessage?.(message.id, "below");
              },
              onUserChange: (userId) => {
                onMessageUserChange?.(message.id, userId);
              },
            }}
          />
        </div>
      </div>
      {lineAtBottom ? (
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-0.5 translate-y-1/2 rounded-full bg-[var(--chat-accent)]"
          aria-hidden
        />
      ) : null}
    </div>
  );
};

const ChatMessages = ({
  messages,
  usersById,
  selfUserId,
  editable = false,
  entranceMessageId,
  entranceDurationMs = DEFAULT_ENTRANCE_MS,
  onMessageContentChange,
  onMessageChooseText,
  onMessageImageChange,
  onMessageImageWidthChange,
  onMessageUserChange,
  onInsertMessage,
  onDeleteMessage,
  onReorderMessage,
  onAddMessage,
  className,
}: ChatMessagesProps) => {
  const dict = useDictionary();
  const locale = useLocale();
  const showNameSpacer = isGroupChat(messages);
  const users = Object.values(usersById);
  const viewer = selfUserId ? usersById[selfUserId] : undefined;
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const entranceRef = useRef<HTMLDivElement>(null);

  const showInsertLine =
    insertAt !== null &&
    dragIndex !== null &&
    insertAt !== dragIndex &&
    insertAt !== dragIndex + 1;

  useEffect(() => {
    if (!entranceMessageId || !entranceRef.current) {
      return;
    }
    // Manual scrollTop — scrollIntoView breaks under the phone CSS scale().
    scrollChatMessagesToBottom(entranceRef.current);
  }, [entranceDurationMs, entranceMessageId]);

  return (
    <div
      data-slot="chat-messages"
      className={cn(
        "conversation-scroll relative z-10 h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain hide-scrollbar",
        className
      )}
    >
      <div className="flex min-h-full flex-col gap-2 px-3 pt-4 pb-6">
        {messages.length === 0 && editable ? (
          <button
            type="button"
            className="group flex min-h-[min(20rem,100%)] w-full flex-1 cursor-pointer items-center justify-center rounded-2xl border border-transparent bg-transparent transition-colors hover:border-dashed hover:border-white/50 hover:bg-white/10 focus-visible:border-dashed focus-visible:border-white/50 focus-visible:bg-white/10"
            aria-label={dict.chat.addMessage}
            onClick={() => onAddMessage?.()}
          >
            <span className="flex flex-col items-center gap-2 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Plus className="size-6 drop-shadow" aria-hidden />
              {dict.chat.addMessage}
            </span>
          </button>
        ) : null}
        {messages.map((message, index) => (
          <ChatMessageRow
            key={message.id}
            message={message}
            index={index}
            messageCount={messages.length}
            previousUserId={index > 0 ? messages[index - 1]?.userId : undefined}
            usersById={usersById}
            users={users}
            viewer={viewer}
            selfUserId={selfUserId}
            editable={editable}
            showNameSpacer={showNameSpacer}
            entranceMessageId={entranceMessageId}
            entranceDurationMs={entranceDurationMs}
            entranceRef={entranceRef}
            dragIndex={dragIndex}
            insertAt={insertAt}
            showInsertLine={showInsertLine}
            locale={locale}
            setDragIndex={setDragIndex}
            setInsertAt={setInsertAt}
            onMessageContentChange={onMessageContentChange}
            onMessageChooseText={onMessageChooseText}
            onMessageImageChange={onMessageImageChange}
            onMessageImageWidthChange={onMessageImageWidthChange}
            onMessageUserChange={onMessageUserChange}
            onInsertMessage={onInsertMessage}
            onDeleteMessage={onDeleteMessage}
            onReorderMessage={onReorderMessage}
          />
        ))}
      </div>
    </div>
  );
};

ChatMessages.displayName = "Chat.Messages";

export { ChatMessages };

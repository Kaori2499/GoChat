"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

import type { ChatUser } from "@/components/chat/chat.types";
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
import { resolveUserName } from "@/lib/user-names";
import { cn } from "@/lib/utils";

import { DEFAULT_NOTIF_TIME_LABEL } from "./notif.helpers";
import type { NotifItemActions, NotifItemProps } from "./notif.types";

const AVATAR_AREA_BG = "#b0f9ef";
const AVATAR_BORDER = "#48dace";
const CONTENT_BG = "#ffffff";
const EMPTY_ACTIONS: NotifItemActions = {};
const EMPTY_USERS: ChatUser[] = [];

const NotifItem = ({
  states,
  actions = EMPTY_ACTIONS,
  editable = false,
  users = EMPTY_USERS,
  className,
}: NotifItemProps) => {
  const dict = useDictionary();
  const locale = useLocale();
  const {
    content,
    timeLabel,
    senderAvatarUrl,
    senderName,
    isUnassigned = false,
  } = states;
  const {
    onContentChange,
    onTimeLabelChange,
    onDelete,
    onInsertAbove,
    onInsertBelow,
    onUserChange,
  } = actions;
  const fallback = (senderName || "?").slice(0, 1);

  const avatarInner = senderAvatarUrl ? (
    <img src={senderAvatarUrl} alt="" className="size-full object-cover" />
  ) : (
    <span
      className="flex size-full items-center justify-center text-[0.65rem] font-semibold text-black/45"
      style={{ backgroundColor: AVATAR_AREA_BG }}
    >
      {isUnassigned ? "" : fallback}
    </span>
  );

  const avatarButton = (
    <div
      className={cn(
        "relative size-8 shrink-0 overflow-hidden rounded-full",
        isUnassigned && "border-dashed"
      )}
      style={{ border: `2px solid ${AVATAR_BORDER}` }}
    >
      {avatarInner}
    </div>
  );

  return (
    <article
      data-slot="notif-item"
      className={cn(
        "group/notif relative flex overflow-hidden rounded-[16px] text-black",
        className
      )}
    >
      <div
        className="flex shrink-0 items-center justify-center px-2.5 py-2"
        style={{ backgroundColor: AVATAR_AREA_BG }}
      >
        {editable ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="cursor-pointer rounded-full outline-none"
              aria-label={dict.notif.changeSender}
            >
              {avatarButton}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="bottom"
              className="w-auto min-w-44"
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
                  <span className="truncate">
                    {resolveUserName(user, locale)}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          avatarButton
        )}
      </div>
      <div
        className="w-px shrink-0 self-stretch"
        style={{ backgroundColor: AVATAR_AREA_BG }}
        aria-hidden
      />
      <div
        className="relative min-w-0 flex-1 px-2.5 py-1.5"
        style={{ backgroundColor: CONTENT_BG }}
      >
        <div className="flex items-baseline gap-2">
          <h3
            className={cn(
              "min-w-0 flex-1 truncate text-[0.78rem] font-semibold tracking-tight",
              isUnassigned && "text-black/40"
            )}
          >
            {isUnassigned
              ? dict.notif.selectUser
              : senderName || dict.notif.unknown}
          </h3>
          {editable ? (
            <span
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              role="textbox"
              aria-label={dict.notif.editTime}
              tabIndex={0}
              data-placeholder={DEFAULT_NOTIF_TIME_LABEL}
              className="shrink-0 text-[0.65rem] leading-none text-black/45 outline-none empty:before:text-black/30 empty:before:content-[attr(data-placeholder)]"
              onBlur={(event) => {
                const next = event.currentTarget.textContent?.trim() ?? "";
                if (next !== timeLabel) {
                  onTimeLabelChange?.(next || DEFAULT_NOTIF_TIME_LABEL);
                  if (!next) {
                    event.currentTarget.textContent = DEFAULT_NOTIF_TIME_LABEL;
                  }
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
              }}
            >
              {timeLabel}
            </span>
          ) : (
            <span className="shrink-0 text-[0.65rem] leading-none text-black/45">
              {timeLabel}
            </span>
          )}
        </div>
        {editable ? (
          <div
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            role="textbox"
            aria-label={dict.notif.editNotification}
            tabIndex={0}
            data-placeholder={dict.notif.messagePlaceholder}
            className="mt-0.5 m-0 line-clamp-2 min-h-[1em] text-[0.72rem] leading-snug outline-none empty:before:text-black/35 empty:before:content-[attr(data-placeholder)]"
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
          </div>
        ) : (
          <p className="mt-0.5 line-clamp-2 text-[0.72rem] leading-snug text-black/70">
            {content || "\u00A0"}
          </p>
        )}
        {editable ? (
          <div
            className="absolute right-1 bottom-1 z-20 flex flex-row gap-0.5 opacity-0 transition-opacity group-hover/notif:opacity-100 focus-within:opacity-100"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Button
              type="button"
              size="icon-xs"
              variant="secondary"
              className="size-5 shadow-sm"
              aria-label={dict.notif.insertAbove}
              onClick={onInsertAbove}
            >
              <ArrowUp className="size-3" />
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant="secondary"
              className="size-5 shadow-sm"
              aria-label={dict.notif.insertBelow}
              onClick={onInsertBelow}
            >
              <ArrowDown className="size-3" />
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant="secondary"
              className="size-5 text-destructive shadow-sm"
              aria-label={dict.notif.delete}
              onClick={onDelete}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
};

NotifItem.displayName = "Notif.Item";

export { NotifItem };

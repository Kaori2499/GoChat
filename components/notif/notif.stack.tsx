"use client";

import { Plus } from "lucide-react";

import {
  useDictionary,
  useLocale,
} from "@/components/i18n/dictionary-provider";
import { resolveDisplayName } from "@/lib/user-names";
import { cn } from "@/lib/utils";

import { resolveNotifSender, resolveNotifTimeLabel } from "./notif.helpers";
import { NotifItem } from "./notif.item";
import type { NotifStackProps } from "./notif.types";

const NotifStack = ({
  notifications,
  usersById,
  selfUserId,
  editable = false,
  onAddNotification,
  onContentChange,
  onTimeLabelChange,
  onDeleteNotification,
  onInsertNotification,
  onUserChange,
  className,
}: NotifStackProps) => {
  const dict = useDictionary();
  const locale = useLocale();
  const users = Object.values(usersById);
  const viewer = selfUserId ? usersById[selfUserId] : undefined;

  if (notifications.length === 0) {
    if (!editable) {
      return (
        <div
          data-slot="notif-stack"
          className={cn(
            "flex items-center justify-center px-6 text-center text-sm text-white/70",
            className
          )}
        >
          {dict.notif.noNotifications}
        </div>
      );
    }

    return (
      <button
        type="button"
        data-slot="notif-stack"
        className={cn(
          "group flex min-h-24 w-full cursor-pointer items-center justify-center rounded-2xl border border-transparent px-3 transition-colors hover:border-dashed hover:border-white/50 hover:bg-white/10",
          className
        )}
        aria-label={dict.notif.addNotification}
        onClick={() => onAddNotification?.()}
      >
        <span className="flex flex-col items-center gap-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Plus className="size-5 drop-shadow" aria-hidden />
          {dict.notif.addNotification}
        </span>
      </button>
    );
  }

  return (
    <div
      data-slot="notif-stack"
      className={cn("flex w-full flex-col gap-1.5", className)}
    >
      {notifications.map((item) => {
        const sender = resolveNotifSender(item, usersById);
        const isUnassigned = !item.message.userId;
        return (
          <NotifItem
            key={item.id}
            editable={editable}
            users={users}
            states={{
              content: item.message.content,
              isUnassigned,
              senderAvatarUrl: sender?.avatarUrl,
              senderName: sender
                ? resolveDisplayName(viewer, sender, locale)
                : item.chatTitle,
              timeLabel: resolveNotifTimeLabel(item),
            }}
            actions={{
              onContentChange: (content) => {
                onContentChange?.(item.id, content);
              },
              onDelete: () => {
                onDeleteNotification?.(item.id);
              },
              onInsertAbove: () => {
                onInsertNotification?.(item.id, "above");
              },
              onInsertBelow: () => {
                onInsertNotification?.(item.id, "below");
              },
              onTimeLabelChange: (timeLabel) => {
                onTimeLabelChange?.(item.id, timeLabel);
              },
              onUserChange: (userId) => {
                onUserChange?.(item.id, userId);
              },
            }}
          />
        );
      })}
      {editable ? (
        <button
          type="button"
          className="group flex h-8 w-full items-center justify-center rounded-xl border border-transparent text-white/0 transition-colors hover:border-dashed hover:border-white/40 hover:bg-white/10 hover:text-white/90"
          aria-label={dict.notif.addNotification}
          onClick={() => onAddNotification?.()}
        >
          <Plus className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      ) : null}
    </div>
  );
};

NotifStack.displayName = "Notif.Stack";

export { NotifStack };

"use client";

import { useState } from "react";
import type { RefObject } from "react";

import { useDictionary } from "@/components/i18n/dictionary-provider";
import { Notif } from "@/components/notif/notif";
import {
  createEmptyNotification,
  createNotifClockState,
} from "@/components/notif/notif.helpers";
import type {
  NotifClockState,
  NotifItemData,
  NotifPreset,
} from "@/components/notif/notif.types";

import { useSessionStore } from "../hooks/use-session-store";
import { NONE_USER } from "../lib/studio.lib";

export const StudioNotifCanvas = ({
  notifPresets,
  exportRootRef,
}: {
  notifPresets: NotifPreset[];
  exportRootRef?: RefObject<HTMLDivElement | null>;
}) => {
  const dict = useDictionary();
  const activeUserId = useSessionStore((state) => state.activeUserId);
  const usersById = useSessionStore((state) => state.usersById);
  const [preset] = notifPresets;

  const [clock, setClock] = useState<NotifClockState>(() =>
    createNotifClockState()
  );
  const [notifications, setNotifications] = useState<NotifItemData[]>(
    () => preset?.notifications ?? []
  );

  if (!preset) {
    return (
      <p className="text-sm text-muted-foreground">
        {dict.notif.noPresets}
      </p>
    );
  }

  const insertNotification = (
    anchorId: string,
    position: "above" | "below"
  ) => {
    setNotifications((current) => {
      const index = current.findIndex((item) => item.id === anchorId);
      if (index === -1) {
        return current;
      }
      const insertAt = position === "above" ? index : index + 1;
      const next = [...current];
      next.splice(insertAt, 0, createEmptyNotification());
      return next;
    });
  };

  return (
    <Notif.Preview
      notifications={notifications}
      usersById={usersById}
      clock={clock}
      selfUserId={activeUserId === NONE_USER ? undefined : activeUserId}
      editable
      exportRootRef={exportRootRef}
      onClockChange={setClock}
      onAddNotification={() => {
        setNotifications((current) => [...current, createEmptyNotification()]);
      }}
      onClearNotifications={() => {
        setNotifications([]);
      }}
      onContentChange={(notifId, content) => {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notifId
              ? {
                  ...item,
                  message: { ...item.message, content },
                }
              : item
          )
        );
      }}
      onTimeLabelChange={(notifId, timeLabel) => {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notifId ? { ...item, timeLabel } : item
          )
        );
      }}
      onDeleteNotification={(notifId) => {
        setNotifications((current) =>
          current.filter((item) => item.id !== notifId)
        );
      }}
      onInsertNotification={insertNotification}
      onUserChange={(notifId, userId) => {
        const user = usersById[userId];
        setNotifications((current) =>
          current.map((item) =>
            item.id === notifId
              ? {
                  ...item,
                  chatTitle: user?.name ?? item.chatTitle,
                  message: { ...item.message, userId },
                }
              : item
          )
        );
      }}
    />
  );
};

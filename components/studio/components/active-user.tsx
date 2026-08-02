"use client";

import { useEffect } from "react";

import {
  useDictionary,
  useLocale,
} from "@/components/i18n/dictionary-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveUserName } from "@/lib/user-names";

import { useCatalogStore } from "../hooks/use-catalog-store";
import { useDraftsStore } from "../hooks/use-drafts-store";
import { useSessionStore } from "../hooks/use-session-store";
import { NONE_USER } from "../lib/studio.lib";

const resolveStoredActiveUser = (
  storedId: string | undefined,
  usersById: Record<string, unknown>
): string => {
  if (!storedId || storedId === NONE_USER) {
    return NONE_USER;
  }
  return usersById[storedId] ? storedId : NONE_USER;
};

export const StudioActiveUser = () => {
  const activeUserId = useSessionStore((state) => state.activeUserId);
  const setActiveUserId = useSessionStore((state) => state.setActiveUserId);
  const usersById = useSessionStore((state) => state.usersById);
  const selectedId = useCatalogStore((state) => state.selectedId);
  const storedActiveUserId = useDraftsStore((state) =>
    selectedId ? state.byChatId[selectedId]?.activeUserId : undefined
  );
  const setChatActiveUser = useDraftsStore((state) => state.setChatActiveUser);
  const users = Object.values(usersById);
  const dict = useDictionary();
  const locale = useLocale();

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    setActiveUserId(resolveStoredActiveUser(storedActiveUserId, usersById));
  }, [selectedId, setActiveUserId, storedActiveUserId, usersById]);

  const activeUser =
    activeUserId === NONE_USER ? undefined : usersById[activeUserId];
  const activeUserLabel = activeUser
    ? resolveUserName(activeUser, locale)
    : dict.activeUser.none;

  return (
    <div data-slot="studio-active-user">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {dict.activeUser.label}
      </p>
      <Select
        value={activeUserId}
        onValueChange={(value) => {
          if (typeof value !== "string") {
            return;
          }
          setActiveUserId(value);
          if (selectedId) {
            setChatActiveUser(selectedId, value);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={dict.activeUser.none}>
            {activeUserLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start" alignItemWithTrigger={false}>
          <SelectItem value={NONE_USER}>{dict.activeUser.none}</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {/* oxlint-disable-next-line next/no-img-element -- small avatar in select */}
              <img
                src={user.avatarUrl}
                alt=""
                className="size-5 rounded-full object-cover"
              />
              {resolveUserName(user, locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

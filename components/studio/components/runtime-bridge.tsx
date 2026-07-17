"use client";

import { useEffect } from "react";

import type { ChatPreset, ChatUser } from "@/components/chat/chat.types";

import { useStudioStore } from "../lib/studio-kit";

/** Maps shell props → store (sync*, no emit). */
export const StudioRuntimeBridge = ({
  chatPresets,
  usersById,
}: {
  chatPresets: ChatPreset[];
  usersById: Record<string, ChatUser>;
}) => {
  const syncPresets = useStudioStore((state) => state.catalog.syncPresets);
  const syncUsers = useStudioStore((state) => state.session.syncUsers);

  useEffect(() => {
    syncPresets(chatPresets);
  }, [chatPresets, syncPresets]);

  useEffect(() => {
    syncUsers(usersById);
  }, [syncUsers, usersById]);

  return null;
};

"use client";

import { useEffect } from "react";

import { saveChatPersistence } from "../lib/chat-drafts-storage";
import { useStudioStore } from "../lib/studio-kit";

/** Persists chat drafts + user-created presets to localStorage. */
export const DraftsPersistenceSetup = () => {
  const byChatId = useStudioStore((state) => state.drafts.byChatId);
  const presets = useStudioStore((state) => state.catalog.presets);
  const selectedId = useStudioStore((state) => state.catalog.selectedId);
  const removedPresetIds = useStudioStore(
    (state) => state.catalog.removedPresetIds
  );

  useEffect(() => {
    saveChatPersistence({
      byChatId,
      presets,
      removedPresetIds,
      selectedId,
    });
  }, [byChatId, presets, removedPresetIds, selectedId]);

  return null;
};

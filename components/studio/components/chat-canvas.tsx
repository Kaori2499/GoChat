"use client";

import type { RefObject } from "react";

import { Chat } from "@/components/chat/chat";

import { useCatalogStore } from "../hooks/use-catalog-store";
import { useDraftsStore } from "../hooks/use-drafts-store";
import { usePlaybackStore } from "../hooks/use-playback-store";
import { useSessionStore } from "../hooks/use-session-store";
import {
  NONE_USER,
  resolveDisplayMessages,
  resolveDraft,
  resolveEntranceMessageId,
} from "../lib/studio.lib";

export const StudioChatCanvas = ({
  exportRootRef,
}: {
  exportRootRef?: RefObject<HTMLDivElement | null>;
}) => {
  const selectedId = useCatalogStore((state) => state.selectedId);
  const presets = useCatalogStore((state) => state.presets);
  const byChatId = useDraftsStore((state) => state.byChatId);
  const setTitle = useDraftsStore((state) => state.setTitle);
  const setMessageContent = useDraftsStore((state) => state.setMessageContent);
  const setMessageKindText = useDraftsStore(
    (state) => state.setMessageKindText
  );
  const setMessageImage = useDraftsStore((state) => state.setMessageImage);
  const setMessageImageWidth = useDraftsStore(
    (state) => state.setMessageImageWidth
  );
  const setMessageUser = useDraftsStore((state) => state.setMessageUser);
  const insertMessage = useDraftsStore((state) => state.insertMessage);
  const deleteMessage = useDraftsStore((state) => state.deleteMessage);
  const reorderMessage = useDraftsStore((state) => state.reorderMessage);
  const addMessage = useDraftsStore((state) => state.addMessage);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const visibleCount = usePlaybackStore((state) => state.visibleCount);
  const timeScale = usePlaybackStore((state) => state.timeScale);
  const activeUserId = useSessionStore((state) => state.activeUserId);
  const usersById = useSessionStore((state) => state.usersById);

  const preset = presets.find((item) => item.id === selectedId);
  const draft = resolveDraft(preset, byChatId);

  if (!preset || !draft) {
    return (
      <p className="text-sm text-muted-foreground">No chat presets found.</p>
    );
  }

  const displayMessages = resolveDisplayMessages(
    draft.messages,
    isPlaying,
    visibleCount
  );
  const entranceMessageId = resolveEntranceMessageId(
    draft.messages,
    isPlaying,
    visibleCount
  );
  const entranceDurationMs = Math.round(300 / timeScale);

  return (
    <Chat.Preview
      title={draft.title}
      messages={displayMessages}
      usersById={usersById}
      selfUserId={activeUserId === NONE_USER ? undefined : activeUserId}
      editable={!isPlaying}
      entranceMessageId={entranceMessageId}
      entranceDurationMs={entranceDurationMs}
      exportRootRef={exportRootRef}
      onTitleChange={(nextTitle) => {
        setTitle(preset.id, nextTitle);
      }}
      onMessageContentChange={(messageId, content) => {
        setMessageContent(preset.id, messageId, content);
      }}
      onMessageChooseText={(messageId) => {
        setMessageKindText(preset.id, messageId);
      }}
      onMessageImageChange={(messageId, imageUrl) => {
        setMessageImage(preset.id, messageId, imageUrl);
      }}
      onMessageImageWidthChange={(messageId, imageWidth) => {
        setMessageImageWidth(preset.id, messageId, imageWidth);
      }}
      onMessageUserChange={(messageId, userId) => {
        setMessageUser(preset.id, messageId, userId);
      }}
      onInsertMessage={(anchorId, position) => {
        insertMessage(preset.id, anchorId, position);
      }}
      onDeleteMessage={(messageId) => {
        deleteMessage(preset.id, messageId);
      }}
      onReorderMessage={(fromIndex, toIndex) => {
        reorderMessage(preset.id, fromIndex, toIndex);
      }}
      onAddMessage={() => {
        addMessage(preset.id);
      }}
    />
  );
};

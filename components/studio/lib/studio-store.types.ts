import type { ChatPreset, ChatUser } from "@/components/chat/chat.types";

import type { ChatDraft, StudioMode } from "./studio.lib";

export const CATALOG_FEATURE_KEY = "catalog";
export const DRAFTS_FEATURE_KEY = "drafts";
export const PLAYBACK_FEATURE_KEY = "playback";
export const SESSION_FEATURE_KEY = "session";

export interface CatalogStore {
  presets: ChatPreset[];
  selectedId: string;
  removedPresetIds: string[];
  addEmptyPreset: () => void;
  deletePreset: (chatId: string) => void;
  selectPreset: (chatId: string) => void;
  syncPresets: (presets: ChatPreset[]) => void;
}

export interface DraftsStore {
  byChatId: Record<string, ChatDraft>;
  addMessage: (chatId: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  ensureDraft: (preset: ChatPreset) => void;
  insertMessage: (
    chatId: string,
    anchorId: string,
    position: "above" | "below"
  ) => void;
  reorderMessage: (chatId: string, fromIndex: number, toIndex: number) => void;
  setMessageContent: (
    chatId: string,
    messageId: string,
    content: string
  ) => void;
  setMessageKindText: (chatId: string, messageId: string) => void;
  setMessageImage: (
    chatId: string,
    messageId: string,
    imageUrl?: string
  ) => void;
  setMessageImageWidth: (
    chatId: string,
    messageId: string,
    imageWidth: number
  ) => void;
  setMessageUser: (chatId: string, messageId: string, userId: string) => void;
  setChatActiveUser: (chatId: string, userId: string) => void;
  setTitle: (chatId: string, title: string) => void;
}

export interface PlaybackStore {
  gapMs: number;
  firstMessageDelayMs: number;
  completeDelayMs: number;
  isPlaying: boolean;
  /**
   * When false, PlaybackSetup does not auto-advance reveals — export drives
   * them lockstep with frame capture instead.
   */
  autoReveal: boolean;
  /**
   * Content speed multiplier. `1` = realtime; values below 1 slow
   * reveals/animations (used sparingly; export prefers lockstep instead).
   */
  timeScale: number;
  visibleCount: number;
  completePlayback: () => void;
  revealNext: () => void;
  setAutoReveal: (autoReveal: boolean) => void;
  setCompleteDelayMs: (completeDelayMs: number) => void;
  setFirstMessageDelayMs: (firstMessageDelayMs: number) => void;
  setGapMs: (gapMs: number) => void;
  setTimeScale: (timeScale: number) => void;
  startPlayback: (
    messageCount: number,
    options?: { deferFirst?: boolean }
  ) => void;
  stopPlayback: () => void;
}

export interface SessionStore {
  activeUserId: string;
  mode: StudioMode;
  setActiveUserId: (userId: string) => void;
  setMode: (mode: StudioMode) => void;
  syncUsers: (usersById: Record<string, ChatUser>) => void;
  usersById: Record<string, ChatUser>;
}

export interface StudioRuntimeStore {
  catalog: CatalogStore;
  drafts: DraftsStore;
  playback: PlaybackStore;
  session: SessionStore;
}

export interface StudioKitEvents extends Record<string, unknown> {
  playbackcomplete: Record<string, never>;
  presetchange: { chatId: string };
}

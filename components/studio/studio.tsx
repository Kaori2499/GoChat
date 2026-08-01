"use client";

import { StudioActiveUser } from "./components/active-user";
import { StudioChatCanvas } from "./components/chat-canvas";
import { StudioChatExport } from "./components/chat-export";
import { StudioModeToggle } from "./components/mode-toggle";
import { StudioNotifCanvas } from "./components/notif-canvas";
import { StudioNotifExport } from "./components/notif-export";
import { StudioPlayback } from "./components/playback-controls";
import { StudioPresetList } from "./components/preset-list";
import { StudioRuntimeBridge } from "./components/runtime-bridge";
import { StudioShell } from "./components/studio-shell";
import { StudioWorkspace } from "./components/studio-workspace";
import { PlaybackSetup } from "./hooks/use-playback-setup";
import { StudioProvider } from "./lib/studio-kit";
import type { StudioRootProps } from "./studio.types";

const StudioRoot = ({
  chatPresets,
  notifPresets,
  usersById,
}: StudioRootProps) => (
  <StudioProvider>
    <StudioRuntimeBridge chatPresets={chatPresets} usersById={usersById} />
    <PlaybackSetup />
    <StudioShell>
      <StudioModeToggle />
      <StudioWorkspace notifPresets={notifPresets} />
    </StudioShell>
  </StudioProvider>
);

StudioRoot.displayName = "Studio";

export const Studio = Object.assign(StudioRoot, {
  ActiveUser: StudioActiveUser,
  ChatCanvas: StudioChatCanvas,
  ChatExport: StudioChatExport,
  ModeToggle: StudioModeToggle,
  NotifCanvas: StudioNotifCanvas,
  NotifExport: StudioNotifExport,
  Playback: StudioPlayback,
  PresetList: StudioPresetList,
  Provider: StudioProvider,
  Shell: StudioShell,
  Workspace: StudioWorkspace,
});

export type { StudioRootProps } from "./studio.types";
export type { ChatDraft, StudioMode } from "./lib/studio.lib";
export type { StudioRuntimeStore } from "./lib/studio-store.types";
export {
  createEmptyMessage,
  createEmptyPreset,
  formatGap,
} from "./lib/studio.lib";
export { useCatalogStore } from "./hooks/use-catalog-store";
export { useDraftsStore } from "./hooks/use-drafts-store";
export { usePlaybackStore } from "./hooks/use-playback-store";
export { useSessionStore } from "./hooks/use-session-store";

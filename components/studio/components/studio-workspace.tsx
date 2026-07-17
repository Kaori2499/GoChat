"use client";

import { useRef } from "react";

import type { NotifPreset } from "@/components/notif/notif.types";

import { useSessionStore } from "../hooks/use-session-store";
import { StudioActiveUser } from "./active-user";
import { StudioChatCanvas } from "./chat-canvas";
import { StudioNotifCanvas } from "./notif-canvas";
import { StudioNotifExport } from "./notif-export";
import { StudioPlayback } from "./playback-controls";
import { StudioPresetList } from "./preset-list";

export const StudioWorkspace = ({
  notifPresets,
}: {
  notifPresets: NotifPreset[];
}) => {
  const mode = useSessionStore((state) => state.mode);
  const notifExportRef = useRef<HTMLDivElement>(null);

  return (
    <div
      data-slot="studio-workspace"
      className="relative flex flex-1 items-center justify-center px-6 pt-8 pb-10"
    >
      {mode === "chat" ? (
        <div className="relative">
          <StudioPresetList />
          <aside className="absolute top-0 left-full ml-16 flex w-56 flex-col gap-6">
            <StudioActiveUser />
            <StudioPlayback />
          </aside>
          <StudioChatCanvas />
        </div>
      ) : (
        <div className="relative">
          <aside className="absolute top-0 left-full ml-16 flex w-56 flex-col gap-6">
            <StudioActiveUser />
            <StudioNotifExport targetRef={notifExportRef} />
          </aside>
          <StudioNotifCanvas
            notifPresets={notifPresets}
            exportRootRef={notifExportRef}
          />
        </div>
      )}
    </div>
  );
};

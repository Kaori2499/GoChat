"use client";

import {
  IPHONE_HEIGHT,
  IPHONE_WIDTH,
  usePhonePreviewScale,
} from "@/hooks/use-phone-preview-scale";
import { cn } from "@/lib/utils";

import { NotifBody } from "./notif.body";
import { NotifHeader } from "./notif.header";
import { resolveNotifWallpaperUrl } from "./notif.helpers";
import { NotifLockScreen } from "./notif.lock-screen";
import { NotifShell } from "./notif.shell";
import { NotifStack } from "./notif.stack";
import type { NotifPreviewProps } from "./notif.types";

const NotifPreview = ({
  notifications,
  usersById,
  clock,
  selfUserId,
  wallpaperUrl,
  editable = false,
  onClockChange,
  onAddNotification,
  onClearNotifications,
  onContentChange,
  onTimeLabelChange,
  onDeleteNotification,
  onInsertNotification,
  onUserChange,
  exportRootRef,
  className,
}: NotifPreviewProps) => {
  const wallpaper = resolveNotifWallpaperUrl(
    usersById,
    selfUserId,
    wallpaperUrl
  );
  const { height, scale, width } = usePhonePreviewScale();

  return (
    <div
      data-slot="notif-preview"
      className={cn("relative shrink-0", className)}
      style={{ height, width }}
    >
      <div
        className="origin-top-left"
        style={{
          height: IPHONE_HEIGHT,
          transform: `scale(${scale})`,
          width: IPHONE_WIDTH,
        }}
      >
        <NotifShell
          ref={exportRootRef}
          className="h-full w-full rounded-[47px] border border-black/10"
          wallpaperUrl={wallpaper}
        >
          <div className="relative flex h-full min-h-0 flex-col">
            <NotifLockScreen
              className="absolute inset-x-0 top-0 z-20"
              clock={clock}
              editable={editable}
              onClockChange={onClockChange}
            />
            <div className="relative z-10 flex h-full min-h-0 flex-col justify-center">
              <NotifHeader onClose={onClearNotifications} />
              <NotifBody>
                <NotifStack
                  notifications={notifications}
                  usersById={usersById}
                  selfUserId={selfUserId}
                  editable={editable}
                  onAddNotification={onAddNotification}
                  onContentChange={onContentChange}
                  onTimeLabelChange={onTimeLabelChange}
                  onDeleteNotification={onDeleteNotification}
                  onInsertNotification={onInsertNotification}
                  onUserChange={onUserChange}
                />
              </NotifBody>
            </div>
          </div>
        </NotifShell>
      </div>
    </div>
  );
};

NotifPreview.displayName = "Notif.Preview";

export { NotifPreview };

import { NotifBody } from "./notif.body";
import { NotifHeader } from "./notif.header";
import { NotifItem } from "./notif.item";
import { NotifLockScreen } from "./notif.lock-screen";
import { NotifPreview } from "./notif.preview";
import { NotifShell } from "./notif.shell";
import { NotifStack } from "./notif.stack";

export type {
  NotifBodyProps,
  NotifClockState,
  NotifHeaderProps,
  NotifItemActions,
  NotifItemData,
  NotifItemProps,
  NotifItemStates,
  NotifLockScreenProps,
  NotifPreset,
  NotifPreviewProps,
  NotifShellProps,
  NotifStackProps,
} from "./notif.types";

export {
  createEmptyNotification,
  createNotifClockState,
  formatLockDatePart,
  formatLockTime,
  formatLockWeekday,
  resolveNotifSender,
  resolveNotifWallpaperUrl,
} from "./notif.helpers";

export const Notif = Object.assign(NotifShell, {
  Body: NotifBody,
  Header: NotifHeader,
  Item: NotifItem,
  LockScreen: NotifLockScreen,
  Preview: NotifPreview,
  Stack: NotifStack,
});

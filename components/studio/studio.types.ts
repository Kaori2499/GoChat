import type { ChatPreset, ChatUser } from "@/components/chat/chat.types";
import type { NotifPreset } from "@/components/notif/notif.types";

export interface StudioRootProps {
  chatPresets: ChatPreset[];
  notifPresets: NotifPreset[];
  usersById: Record<string, ChatUser>;
}

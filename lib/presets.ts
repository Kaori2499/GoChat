import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import type {
  ChatMessage,
  ChatPreset,
  ChatUser,
} from "@/components/chat/chat.types";
import type {
  NotifItemData,
  NotifPreset,
} from "@/components/notif/notif.types";
import type { LocalizedName } from "@/lib/user-names";

interface UserProfileJson {
  id: string;
  names: LocalizedName;
  aliases?: Record<string, LocalizedName>;
  phoneCaseColor: string;
}

interface ChatPresetJson {
  id: string;
  title: string;
  messages: ChatMessage[];
}

interface NotifPresetJson {
  id: string;
  notifications: NotifItemData[];
}

export const loadUsers = async (): Promise<Record<string, ChatUser>> => {
  const usersDir = path.join(process.cwd(), "public", "presets", "users");
  const entries = await readdir(usersDir, { withFileTypes: true });
  const usersById: Record<string, ChatUser> = {};

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const profilePath = path.join(usersDir, entry.name, "profile.json");
    const raw = await readFile(profilePath, "utf-8");
    const profile = JSON.parse(raw) as UserProfileJson;

    usersById[profile.id] = {
      aliases: profile.aliases ?? {},
      avatarUrl: `/presets/users/${profile.id}/avatar.jpg`,
      id: profile.id,
      names: profile.names,
      phoneCaseColor: profile.phoneCaseColor,
      wallpaperUrl: `/presets/users/${profile.id}/wallpaper.jpg`,
    };
  }

  return usersById;
};

export const loadChatPresets = async (): Promise<ChatPreset[]> => {
  const chatsDir = path.join(process.cwd(), "public", "presets", "chats");
  const files = (await readdir(chatsDir))
    .filter((file) => file.endsWith(".json"))
    .toSorted();

  const presets: ChatPreset[] = [];

  for (const fileName of files) {
    const raw = await readFile(path.join(chatsDir, fileName), "utf-8");
    const data = JSON.parse(raw) as ChatPresetJson;
    presets.push({
      fileName,
      id: data.id,
      messages: data.messages,
      title: data.title,
    });
  }

  return presets;
};

export const loadNotifPresets = async (): Promise<NotifPreset[]> => {
  const notifsDir = path.join(
    process.cwd(),
    "public",
    "presets",
    "notifications"
  );
  const files = (await readdir(notifsDir))
    .filter((file) => file.endsWith(".json"))
    .toSorted();

  const presets: NotifPreset[] = [];

  for (const fileName of files) {
    const raw = await readFile(path.join(notifsDir, fileName), "utf-8");
    const data = JSON.parse(raw) as NotifPresetJson;
    presets.push({
      fileName,
      id: data.id,
      notifications: data.notifications,
    });
  }

  return presets;
};

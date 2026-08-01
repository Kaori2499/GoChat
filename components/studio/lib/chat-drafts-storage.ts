import type { ChatMessage, ChatPreset } from "@/components/chat/chat.types";
import type { ChatDraft } from "@/components/studio/lib/studio.lib";

const STORAGE_KEY = "gochat.chat-drafts.v1";

interface ChatPersistencePayload {
  version: 2;
  byChatId: Record<string, ChatDraft>;
  localPresets: ChatPreset[];
  selectedId?: string;
  removedPresetIds?: string[];
}

interface LegacyDraftsPayload {
  version: 1;
  byChatId: Record<string, ChatDraft>;
}

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const message = value as ChatMessage;
  return (
    typeof message.id === "string" &&
    typeof message.userId === "string" &&
    typeof message.content === "string"
  );
};

const isChatDraft = (value: unknown): value is ChatDraft => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const draft = value as ChatDraft;
  return (
    typeof draft.title === "string" &&
    Array.isArray(draft.messages) &&
    draft.messages.every(isChatMessage)
  );
};

const isChatPreset = (value: unknown): value is ChatPreset => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const preset = value as ChatPreset;
  return (
    typeof preset.id === "string" &&
    typeof preset.title === "string" &&
    typeof preset.fileName === "string" &&
    Array.isArray(preset.messages) &&
    preset.messages.every(isChatMessage)
  );
};

const sanitizeDraft = (draft: ChatDraft): ChatDraft => ({
  messages: draft.messages.map((message) => ({
    content: message.content,
    id: message.id,
    userId: message.userId,
  })),
  title: draft.title,
});

const sanitizePreset = (preset: ChatPreset): ChatPreset => ({
  fileName: preset.fileName,
  id: preset.id,
  messages: preset.messages.map((message) => ({
    content: message.content,
    id: message.id,
    userId: message.userId,
  })),
  title: preset.title,
});

export interface ChatPersistenceState {
  byChatId: Record<string, ChatDraft>;
  localPresets: ChatPreset[];
  selectedId: string;
  removedPresetIds: string[];
}

const emptyPersistence = (): ChatPersistenceState => ({
  byChatId: {},
  localPresets: [],
  removedPresetIds: [],
  selectedId: "",
});

/** User-created chats (not loaded from public/presets). */
export const isLocalChatPreset = (preset: ChatPreset): boolean =>
  preset.fileName === "";

export const loadChatPersistence = (): ChatPersistenceState => {
  if (typeof window === "undefined") {
    return emptyPersistence();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return emptyPersistence();
    }
    const parsed = JSON.parse(raw) as
      | ChatPersistencePayload
      | LegacyDraftsPayload;

    const removedPresetIds =
      parsed.version === 2 &&
      "removedPresetIds" in parsed &&
      Array.isArray(parsed.removedPresetIds)
        ? parsed.removedPresetIds.filter(
            (id): id is string => typeof id === "string"
          )
        : [];
    const removedSet = new Set(removedPresetIds);

    const byChatId: Record<string, ChatDraft> = {};
    if (parsed.byChatId && typeof parsed.byChatId === "object") {
      for (const [chatId, draft] of Object.entries(parsed.byChatId)) {
        if (removedSet.has(chatId)) {
          continue;
        }
        if (isChatDraft(draft)) {
          byChatId[chatId] = sanitizeDraft(draft);
        }
      }
    }

    const localPresets: ChatPreset[] = [];
    if (
      parsed.version === 2 &&
      "localPresets" in parsed &&
      Array.isArray(parsed.localPresets)
    ) {
      for (const preset of parsed.localPresets) {
        if (isChatPreset(preset) && !removedSet.has(preset.id)) {
          localPresets.push(sanitizePreset(preset));
        }
      }
    }

    // Recover drafts that no longer have a matching local preset entry.
    const knownIds = new Set(localPresets.map((preset) => preset.id));
    for (const [chatId, draft] of Object.entries(byChatId)) {
      if (knownIds.has(chatId) || removedSet.has(chatId)) {
        continue;
      }
      localPresets.push({
        fileName: "",
        id: chatId,
        messages: draft.messages,
        title: draft.title,
      });
      knownIds.add(chatId);
    }

    const selectedId =
      parsed.version === 2 &&
      "selectedId" in parsed &&
      typeof parsed.selectedId === "string"
        ? parsed.selectedId
        : "";

    return { byChatId, localPresets, removedPresetIds, selectedId };
  } catch {
    return emptyPersistence();
  }
};

export const loadChatDrafts = (): Record<string, ChatDraft> =>
  loadChatPersistence().byChatId;

export const loadLocalChatPresets = (): ChatPreset[] =>
  loadChatPersistence().localPresets;

export const loadSelectedChatId = (): string =>
  loadChatPersistence().selectedId;

export const loadRemovedPresetIds = (): string[] =>
  loadChatPersistence().removedPresetIds;

export const saveChatPersistence = (state: {
  byChatId: Record<string, ChatDraft>;
  presets: ChatPreset[];
  selectedId: string;
  removedPresetIds: string[];
}): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const removedSet = new Set(state.removedPresetIds);
    const localPresets = state.presets
      .filter(isLocalChatPreset)
      .filter((preset) => !removedSet.has(preset.id))
      .map(sanitizePreset);
    const byChatId: Record<string, ChatDraft> = {};
    for (const [chatId, draft] of Object.entries(state.byChatId)) {
      if (!removedSet.has(chatId)) {
        byChatId[chatId] = draft;
      }
    }
    const payload: ChatPersistencePayload = {
      byChatId,
      localPresets,
      removedPresetIds: [...removedSet],
      selectedId: state.selectedId,
      version: 2,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota / private-mode failures.
  }
};

import { normalizeChatMessageContent } from "@/components/chat/chat.helpers";
import type { RuntimeFeature } from "@/lib/runtime-kit/create-runtime-kit";

import { DraftsPersistenceSetup } from "../hooks/use-drafts-persistence";
import { loadChatDrafts } from "./chat-drafts-storage";
import type { StudioKitEvents, StudioRuntimeStore } from "./studio-store.types";
import { DRAFTS_FEATURE_KEY } from "./studio-store.types";
import type { ChatDraft } from "./studio.lib";
import {
  createEmptyMessage,
  insertMessage,
  reorderMessages,
} from "./studio.lib";

const withDraft = (
  byChatId: Record<string, ChatDraft>,
  chatId: string,
  base: ChatDraft | undefined,
  updater: (draft: ChatDraft) => void
): Record<string, ChatDraft> => {
  const current = byChatId[chatId] ??
    base ?? {
      messages: [],
      title: "New chat",
    };
  const next: ChatDraft = {
    messages: [...current.messages],
    title: current.title,
  };
  if (current.activeUserId !== undefined) {
    next.activeUserId = current.activeUserId;
  }
  updater(next);
  return { ...byChatId, [chatId]: next };
};

export const draftsFeature = (): RuntimeFeature<
  StudioRuntimeStore,
  StudioKitEvents
> => ({
  Setup: DraftsPersistenceSetup,
  createSlice: (set, get) => ({
    drafts: {
      addMessage: (chatId) => {
        const preset = get().catalog.presets.find((p) => p.id === chatId);
        set((state) => {
          state.drafts.byChatId = withDraft(
            state.drafts.byChatId,
            chatId,
            preset
              ? { messages: preset.messages, title: preset.title }
              : undefined,
            (draft) => {
              draft.messages.push(createEmptyMessage());
            }
          );
        });
      },
      byChatId: loadChatDrafts(),
      deleteMessage: (chatId, messageId) => {
        const preset = get().catalog.presets.find((p) => p.id === chatId);
        set((state) => {
          state.drafts.byChatId = withDraft(
            state.drafts.byChatId,
            chatId,
            preset
              ? { messages: preset.messages, title: preset.title }
              : undefined,
            (draft) => {
              draft.messages = draft.messages.filter(
                (message) => message.id !== messageId
              );
            }
          );
        });
      },
      ensureDraft: (preset) => {
        set((state) => {
          if (state.drafts.byChatId[preset.id]) {
            return;
          }
          state.drafts.byChatId[preset.id] = {
            messages: preset.messages,
            title: preset.title,
          };
        });
      },
      insertMessage: (chatId, anchorId, position) => {
        const preset = get().catalog.presets.find((p) => p.id === chatId);
        set((state) => {
          state.drafts.byChatId = withDraft(
            state.drafts.byChatId,
            chatId,
            preset
              ? { messages: preset.messages, title: preset.title }
              : undefined,
            (draft) => {
              draft.messages = insertMessage(
                draft.messages,
                anchorId,
                position
              );
            }
          );
        });
      },
      reorderMessage: (chatId, fromIndex, toIndex) => {
        const preset = get().catalog.presets.find((p) => p.id === chatId);
        set((state) => {
          state.drafts.byChatId = withDraft(
            state.drafts.byChatId,
            chatId,
            preset
              ? { messages: preset.messages, title: preset.title }
              : undefined,
            (draft) => {
              draft.messages = reorderMessages(
                draft.messages,
                fromIndex,
                toIndex
              );
            }
          );
        });
      },
      setChatActiveUser: (chatId, userId) => {
        const preset = get().catalog.presets.find((p) => p.id === chatId);
        set((state) => {
          state.drafts.byChatId = withDraft(
            state.drafts.byChatId,
            chatId,
            preset
              ? { messages: preset.messages, title: preset.title }
              : undefined,
            (draft) => {
              draft.activeUserId = userId;
            }
          );
        });
      },
      setMessageContent: (chatId, messageId, content) => {
        const preset = get().catalog.presets.find((p) => p.id === chatId);
        set((state) => {
          state.drafts.byChatId = withDraft(
            state.drafts.byChatId,
            chatId,
            preset
              ? { messages: preset.messages, title: preset.title }
              : undefined,
            (draft) => {
              draft.messages = draft.messages.map((message) =>
                message.id === messageId
                  ? {
                      content: normalizeChatMessageContent(content),
                      id: message.id,
                      kind: "text" as const,
                      userId: message.userId,
                    }
                  : message
              );
            }
          );
        });
      },
      setMessageImage: (chatId, messageId, imageUrl) => {
        const preset = get().catalog.presets.find((p) => p.id === chatId);
        set((state) => {
          state.drafts.byChatId = withDraft(
            state.drafts.byChatId,
            chatId,
            preset
              ? { messages: preset.messages, title: preset.title }
              : undefined,
            (draft) => {
              draft.messages = draft.messages.map((message) => {
                if (message.id !== messageId) {
                  return message;
                }
                if (imageUrl) {
                  const next = {
                    content: "",
                    id: message.id,
                    imageUrl,
                    kind: "image" as const,
                    userId: message.userId,
                  };
                  if (message.imageWidth) {
                    return { ...next, imageWidth: message.imageWidth };
                  }
                  return next;
                }
                return {
                  content: "",
                  id: message.id,
                  userId: message.userId,
                };
              });
            }
          );
        });
      },
      setMessageImageWidth: (chatId, messageId, imageWidth) => {
        const preset = get().catalog.presets.find((p) => p.id === chatId);
        set((state) => {
          state.drafts.byChatId = withDraft(
            state.drafts.byChatId,
            chatId,
            preset
              ? { messages: preset.messages, title: preset.title }
              : undefined,
            (draft) => {
              draft.messages = draft.messages.map((message) => {
                if (message.id !== messageId) {
                  return message;
                }
                if (message.kind !== "image" && !message.imageUrl) {
                  return message;
                }
                return {
                  ...message,
                  imageWidth,
                  kind: "image" as const,
                };
              });
            }
          );
        });
      },
      setMessageKindText: (chatId, messageId) => {
        const preset = get().catalog.presets.find((p) => p.id === chatId);
        set((state) => {
          state.drafts.byChatId = withDraft(
            state.drafts.byChatId,
            chatId,
            preset
              ? { messages: preset.messages, title: preset.title }
              : undefined,
            (draft) => {
              draft.messages = draft.messages.map((message) =>
                message.id === messageId
                  ? {
                      content: message.content,
                      id: message.id,
                      kind: "text" as const,
                      userId: message.userId,
                    }
                  : message
              );
            }
          );
        });
      },
      setMessageUser: (chatId, messageId, userId) => {
        const preset = get().catalog.presets.find((p) => p.id === chatId);
        set((state) => {
          state.drafts.byChatId = withDraft(
            state.drafts.byChatId,
            chatId,
            preset
              ? { messages: preset.messages, title: preset.title }
              : undefined,
            (draft) => {
              draft.messages = draft.messages.map((message) =>
                message.id === messageId ? { ...message, userId } : message
              );
            }
          );
        });
      },
      setTitle: (chatId, title) => {
        const preset = get().catalog.presets.find((p) => p.id === chatId);
        set((state) => {
          state.drafts.byChatId = withDraft(
            state.drafts.byChatId,
            chatId,
            preset
              ? { messages: preset.messages, title: preset.title }
              : undefined,
            (draft) => {
              draft.title = title;
            }
          );
        });
      },
    },
  }),
  key: DRAFTS_FEATURE_KEY,
});

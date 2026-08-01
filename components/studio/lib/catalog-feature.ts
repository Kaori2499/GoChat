import type { RuntimeFeature } from "@/lib/runtime-kit/create-runtime-kit";

import {
  loadLocalChatPresets,
  loadRemovedPresetIds,
  loadSelectedChatId,
} from "./chat-drafts-storage";
import type { StudioKitEvents, StudioRuntimeStore } from "./studio-store.types";
import { CATALOG_FEATURE_KEY } from "./studio-store.types";
import { createEmptyPreset } from "./studio.lib";

export const catalogFeature = (): RuntimeFeature<
  StudioRuntimeStore,
  StudioKitEvents
> => ({
  createSlice: (set, get, _store, events) => ({
    catalog: {
      addEmptyPreset: () => {
        const preset = createEmptyPreset();
        set((state) => {
          state.catalog.presets.push(preset);
          state.catalog.selectedId = preset.id;
          state.catalog.removedPresetIds =
            state.catalog.removedPresetIds.filter((id) => id !== preset.id);
          state.drafts.byChatId[preset.id] = {
            messages: [],
            title: preset.title,
          };
        });
        get().playback.stopPlayback();
        events.emit("presetchange", { chatId: preset.id });
      },
      deletePreset: (chatId) => {
        set((state) => {
          state.catalog.presets = state.catalog.presets.filter(
            (preset) => preset.id !== chatId
          );
          if (!state.catalog.removedPresetIds.includes(chatId)) {
            state.catalog.removedPresetIds.push(chatId);
          }
          delete state.drafts.byChatId[chatId];
          if (state.catalog.selectedId === chatId) {
            state.catalog.selectedId = state.catalog.presets[0]?.id ?? "";
          }
        });
        get().playback.stopPlayback();
        const nextId = get().catalog.selectedId;
        if (nextId) {
          events.emit("presetchange", { chatId: nextId });
        }
      },
      presets: loadLocalChatPresets(),
      removedPresetIds: loadRemovedPresetIds(),
      selectPreset: (chatId) => {
        set((state) => {
          state.catalog.selectedId = chatId;
        });
        get().playback.stopPlayback();
        events.emit("presetchange", { chatId });
      },
      selectedId: loadSelectedChatId(),
      syncPresets: (presets) => {
        set((state) => {
          const removed = new Set(state.catalog.removedPresetIds);
          const seededIds = new Set(presets.map((p) => p.id));
          const localOnly = state.catalog.presets.filter(
            (p) => !seededIds.has(p.id) && !removed.has(p.id)
          );
          state.catalog.presets = [
            ...presets.filter((p) => !removed.has(p.id)),
            ...localOnly,
          ];
          if (
            !state.catalog.selectedId ||
            !state.catalog.presets.some(
              (p) => p.id === state.catalog.selectedId
            )
          ) {
            state.catalog.selectedId = state.catalog.presets[0]?.id ?? "";
          }
        });
      },
    },
  }),
  key: CATALOG_FEATURE_KEY,
});

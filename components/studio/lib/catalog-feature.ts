import type { RuntimeFeature } from "@/lib/runtime-kit/create-runtime-kit";

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
        });
        get().playback.stopPlayback();
        events.emit("presetchange", { chatId: preset.id });
      },
      presets: [],
      selectPreset: (chatId) => {
        set((state) => {
          state.catalog.selectedId = chatId;
        });
        get().playback.stopPlayback();
        events.emit("presetchange", { chatId });
      },
      selectedId: "",
      syncPresets: (presets) => {
        set((state) => {
          const seededIds = new Set(presets.map((p) => p.id));
          const localOnly = state.catalog.presets.filter(
            (p) => !seededIds.has(p.id)
          );
          state.catalog.presets = [...presets, ...localOnly];
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

import type { RuntimeFeature } from "@/lib/runtime-kit/create-runtime-kit";

import type { StudioKitEvents, StudioRuntimeStore } from "./studio-store.types";
import { PLAYBACK_FEATURE_KEY } from "./studio-store.types";
import { DEFAULT_GAP_MS } from "./studio.lib";

export const playbackFeature = (): RuntimeFeature<
  StudioRuntimeStore,
  StudioKitEvents
> => ({
  createSlice: (set, _get, _store, events) => ({
    playback: {
      completePlayback: () => {
        set((state) => {
          state.playback.isPlaying = false;
        });
        events.emit("playbackcomplete", {});
      },
      gapMs: DEFAULT_GAP_MS,
      isPlaying: false,
      revealNext: () => {
        set((state) => {
          state.playback.visibleCount += 1;
        });
      },
      setGapMs: (gapMs) => {
        set((state) => {
          state.playback.gapMs = gapMs;
        });
      },
      setTimeScale: (timeScale) => {
        set((state) => {
          state.playback.timeScale = Math.min(1, Math.max(1 / 32, timeScale));
        });
      },
      startPlayback: (messageCount) => {
        if (messageCount <= 0) {
          return;
        }
        set((state) => {
          state.playback.isPlaying = true;
          // First message appears immediately; gap only applies between later ones.
          state.playback.visibleCount = 1;
        });
      },
      stopPlayback: () => {
        set((state) => {
          state.playback.isPlaying = false;
          state.playback.timeScale = 1;
          state.playback.visibleCount = 0;
        });
      },
      timeScale: 1,
      visibleCount: 0,
    },
  }),
  key: PLAYBACK_FEATURE_KEY,
});

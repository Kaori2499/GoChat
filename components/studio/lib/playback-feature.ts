import type { RuntimeFeature } from "@/lib/runtime-kit/create-runtime-kit";

import type { StudioKitEvents, StudioRuntimeStore } from "./studio-store.types";
import { PLAYBACK_FEATURE_KEY } from "./studio-store.types";
import {
  DEFAULT_GAP_MS,
  DEFAULT_COMPLETE_DELAY_MS,
  DEFAULT_FIRST_MESSAGE_DELAY_MS,
} from "./studio.lib";

export const playbackFeature = (): RuntimeFeature<
  StudioRuntimeStore,
  StudioKitEvents
> => ({
  createSlice: (set, _get, _store, events) => ({
    playback: {
      autoReveal: true,
      completeDelayMs: DEFAULT_COMPLETE_DELAY_MS,
      completePlayback: () => {
        set((state) => {
          state.playback.isPlaying = false;
        });
        events.emit("playbackcomplete", {});
      },
      firstMessageDelayMs: DEFAULT_FIRST_MESSAGE_DELAY_MS,
      gapMs: DEFAULT_GAP_MS,
      isPlaying: false,
      revealNext: () => {
        set((state) => {
          state.playback.visibleCount += 1;
        });
      },
      setAutoReveal: (autoReveal) => {
        set((state) => {
          state.playback.autoReveal = autoReveal;
        });
      },
      setCompleteDelayMs: (completeDelayMs) => {
        set((state) => {
          state.playback.completeDelayMs = completeDelayMs;
        });
      },
      setFirstMessageDelayMs: (firstMessageDelayMs) => {
        set((state) => {
          state.playback.firstMessageDelayMs = firstMessageDelayMs;
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
      startPlayback: (messageCount, options) => {
        if (messageCount <= 0) {
          return;
        }
        set((state) => {
          state.playback.isPlaying = true;
          // Export defers the first reveal; preview waits when first delay > 0.
          state.playback.visibleCount =
            options?.deferFirst || state.playback.firstMessageDelayMs > 0
              ? 0
              : 1;
        });
      },
      stopPlayback: () => {
        set((state) => {
          state.playback.autoReveal = true;
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

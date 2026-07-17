"use client";

import { useStudioStore } from "../lib/studio-kit";
import type { PlaybackStore } from "../lib/studio-store.types";

export const usePlaybackStore = <T>(selector: (state: PlaybackStore) => T): T =>
  useStudioStore((state) => selector(state.playback));

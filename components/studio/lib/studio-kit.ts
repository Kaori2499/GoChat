"use client";

import { createRuntimeKit } from "@/lib/runtime-kit/create-runtime-kit";
import type {
  ImmerStoreApi,
  RuntimeEvents,
} from "@/lib/runtime-kit/create-runtime-kit";

import { catalogFeature } from "./catalog-feature";
import { draftsFeature } from "./drafts-feature";
import { playbackFeature } from "./playback-feature";
import { sessionFeature } from "./session-feature";
import type { StudioKitEvents, StudioRuntimeStore } from "./studio-store.types";

export const studioKit = createRuntimeKit<StudioRuntimeStore, StudioKitEvents>({
  features: [
    catalogFeature(),
    draftsFeature(),
    playbackFeature(),
    sessionFeature(),
  ] as const,
});

export const StudioProvider = studioKit.Provider;

export const useStudioApi = (): ImmerStoreApi<StudioRuntimeStore> =>
  studioKit.useRuntimeApi();

export const useStudioEvents = (): RuntimeEvents<StudioKitEvents> =>
  studioKit.useRuntimeEvents();

export const useStudioStore = studioKit.useRuntimeFeatureStore;

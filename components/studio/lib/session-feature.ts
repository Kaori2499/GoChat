import type { RuntimeFeature } from "@/lib/runtime-kit/create-runtime-kit";

import type { StudioKitEvents, StudioRuntimeStore } from "./studio-store.types";
import { SESSION_FEATURE_KEY } from "./studio-store.types";
import { NONE_USER } from "./studio.lib";

export const sessionFeature = (): RuntimeFeature<
  StudioRuntimeStore,
  StudioKitEvents
> => ({
  createSlice: (set) => ({
    session: {
      activeUserId: NONE_USER,
      mode: "chat",
      setActiveUserId: (userId) => {
        set((state) => {
          state.session.activeUserId = userId;
        });
      },
      setMode: (mode) => {
        set((state) => {
          state.session.mode = mode;
        });
      },
      syncUsers: (usersById) => {
        set((state) => {
          state.session.usersById = usersById;
        });
      },
      usersById: {},
    },
  }),
  key: SESSION_FEATURE_KEY,
});

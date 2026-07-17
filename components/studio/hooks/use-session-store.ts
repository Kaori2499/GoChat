"use client";

import { useStudioStore } from "../lib/studio-kit";
import type { SessionStore } from "../lib/studio-store.types";

export const useSessionStore = <T>(selector: (state: SessionStore) => T): T =>
  useStudioStore((state) => selector(state.session));

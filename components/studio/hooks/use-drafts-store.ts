"use client";

import { useStudioStore } from "../lib/studio-kit";
import type { DraftsStore } from "../lib/studio-store.types";

export const useDraftsStore = <T>(selector: (state: DraftsStore) => T): T =>
  useStudioStore((state) => selector(state.drafts));

"use client";

import { useStudioStore } from "../lib/studio-kit";
import type { CatalogStore } from "../lib/studio-store.types";

export const useCatalogStore = <T>(selector: (state: CatalogStore) => T): T =>
  useStudioStore((state) => selector(state.catalog));

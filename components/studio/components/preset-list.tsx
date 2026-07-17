"use client";

import { Plus } from "lucide-react";

import { useDictionary } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useCatalogStore } from "../hooks/use-catalog-store";
import { useDraftsStore } from "../hooks/use-drafts-store";

export const StudioPresetList = () => {
  const dict = useDictionary();
  const presets = useCatalogStore((state) => state.presets);
  const selectedId = useCatalogStore((state) => state.selectedId);
  const selectPreset = useCatalogStore((state) => state.selectPreset);
  const addEmptyPreset = useCatalogStore((state) => state.addEmptyPreset);
  const byChatId = useDraftsStore((state) => state.byChatId);

  return (
    <aside
      data-slot="studio-preset-list"
      className="absolute top-0 right-full mr-16 w-56"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {dict.presets.label}
        </p>
        <Button
          type="button"
          size="icon-xs"
          variant="outline"
          aria-label={dict.presets.add}
          onClick={addEmptyPreset}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      <ul className="flex w-full flex-col gap-1">
        {presets.map((preset) => {
          const isActive = preset.id === selectedId;
          return (
            <li key={preset.id}>
              <button
                type="button"
                onClick={() => selectPreset(preset.id)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "border-foreground/20 bg-muted font-medium"
                    : "border-transparent hover:bg-muted/60"
                )}
              >
                <span className="block truncate">
                  {byChatId[preset.id]?.title ?? preset.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

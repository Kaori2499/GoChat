"use client";

import { Plus, Trash2 } from "lucide-react";

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
  const deletePreset = useCatalogStore((state) => state.deletePreset);
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
            <li key={preset.id} className="group/preset relative">
              <button
                type="button"
                onClick={() => selectPreset(preset.id)}
                className={cn(
                  "flex w-full items-center rounded-lg border border-transparent py-2 pr-8 pl-3 text-left text-sm font-medium transition-colors",
                  isActive
                    ? "border-foreground/20 bg-muted"
                    : "hover:bg-muted/60"
                )}
              >
                <span className="min-w-0 flex-1 truncate">
                  {byChatId[preset.id]?.title ?? preset.title}
                </span>
              </button>
              <button
                type="button"
                aria-label={dict.presets.delete}
                className="absolute inset-y-0 right-1.5 z-10 my-auto flex size-6 items-center justify-center rounded-[min(var(--radius-md),10px)] text-muted-foreground opacity-0 transition-opacity outline-none group-hover/preset:opacity-100 hover:bg-muted hover:text-destructive focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  deletePreset(preset.id);
                }}
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

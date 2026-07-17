"use client";

import { Play, Square } from "lucide-react";

import { useDictionary } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import { useCatalogStore } from "../hooks/use-catalog-store";
import { useDraftsStore } from "../hooks/use-drafts-store";
import { usePlaybackStore } from "../hooks/use-playback-store";
import {
  formatGap,
  GAP_STEP_MS,
  MAX_GAP_MS,
  MIN_GAP_MS,
  resolveDraft,
} from "../lib/studio.lib";

export const StudioPlayback = () => {
  const dict = useDictionary();
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const gapMs = usePlaybackStore((state) => state.gapMs);
  const setGapMs = usePlaybackStore((state) => state.setGapMs);
  const startPlayback = usePlaybackStore((state) => state.startPlayback);
  const stopPlayback = usePlaybackStore((state) => state.stopPlayback);
  const selectedId = useCatalogStore((state) => state.selectedId);
  const presets = useCatalogStore((state) => state.presets);
  const byChatId = useDraftsStore((state) => state.byChatId);

  const preset = presets.find((item) => item.id === selectedId);
  const draft = resolveDraft(preset, byChatId);
  const messageCount = draft?.messages.length ?? 0;

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    startPlayback(messageCount);
  };

  return (
    <div data-slot="studio-playback">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {dict.playback.label}
      </p>
      <Button
        type="button"
        variant={isPlaying ? "default" : "outline"}
        className="w-full"
        aria-pressed={isPlaying}
        disabled={messageCount === 0}
        onClick={togglePlayback}
      >
        {isPlaying ? <Square /> : <Play />}
        {isPlaying ? dict.playback.stop : dict.playback.play}
      </Button>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {dict.playback.timeGap}
          </p>
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatGap(gapMs)}
          </span>
        </div>
        <Slider
          min={MIN_GAP_MS}
          max={MAX_GAP_MS}
          step={GAP_STEP_MS}
          value={[gapMs]}
          onValueChange={(value) => {
            const next = Array.isArray(value) ? value[0] : value;
            if (typeof next === "number") {
              setGapMs(next);
            }
          }}
        />
      </div>
    </div>
  );
};

"use client";

/* oxlint-disable promise/avoid-new, eslint/no-await-in-loop -- export sequencing is serial */
import { Download, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import type { RefObject } from "react";

import { useDictionary } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_EXPORT_VIDEO_SCALE,
  downloadBlob,
  EXPORT_ENTRANCE_MS,
  EXPORT_VIDEO_FPS,
  EXPORT_VIDEO_SCALES,
  formatExportVideoSize,
  isExportVideoScale,
  startElementVideoRecording,
  videoExtensionForMime,
} from "@/lib/export-playback-video";
import type {
  ExportVideoScale,
  PlaybackVideoRecorder,
} from "@/lib/export-playback-video";

import { useCatalogStore } from "../hooks/use-catalog-store";
import { useDraftsStore } from "../hooks/use-drafts-store";
import { usePlaybackStore } from "../hooks/use-playback-store";
import { PLAYBACK_COMPLETE_DELAY_MS, resolveDraft } from "../lib/studio.lib";

const waitMs = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const waitAnimationFrame = () =>
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });

const prepareEntranceFrame = (
  root: HTMLElement
): ((progress: number) => void) => {
  const row = root.querySelector<HTMLElement>("[data-entrance-message]");
  if (!row) {
    return () => false;
  }
  row.dataset.exportEntrance = "";
  row.scrollIntoView({ behavior: "auto", block: "nearest" });
  row.style.animation = "none";
  return (progress: number) => {
    // Ease-out cubic approximates the existing Tailwind entrance easing.
    const eased = 1 - (1 - progress) ** 3;
    row.style.opacity = String(eased);
    row.style.transform = `translateY(${(1 - eased) * 16}px)`;
  };
};

const resetExportEntranceStyles = (root: HTMLElement | null) => {
  for (const row of root?.querySelectorAll<HTMLElement>(
    "[data-export-entrance]"
  ) ?? []) {
    row.style.removeProperty("animation");
    row.style.removeProperty("opacity");
    row.style.removeProperty("transform");
    delete row.dataset.exportEntrance;
  }
};

export const StudioChatExport = ({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) => {
  const dict = useDictionary();
  const [isExporting, setIsExporting] = useState(false);
  const [scale, setScale] = useState<ExportVideoScale>(
    DEFAULT_EXPORT_VIDEO_SCALE
  );
  const recorderRef = useRef<PlaybackVideoRecorder | null>(null);
  const exportGenerationRef = useRef(0);

  const selectedId = useCatalogStore((state) => state.selectedId);
  const presets = useCatalogStore((state) => state.presets);
  const byChatId = useDraftsStore((state) => state.byChatId);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const gapMs = usePlaybackStore((state) => state.gapMs);
  const startPlayback = usePlaybackStore((state) => state.startPlayback);
  const stopPlayback = usePlaybackStore((state) => state.stopPlayback);
  const revealNext = usePlaybackStore((state) => state.revealNext);
  const setAutoReveal = usePlaybackStore((state) => state.setAutoReveal);
  const completePlayback = usePlaybackStore((state) => state.completePlayback);

  const preset = presets.find((item) => item.id === selectedId);
  const draft = resolveDraft(preset, byChatId);
  const messageCount = draft?.messages.length ?? 0;

  const cancelExport = () => {
    exportGenerationRef.current += 1;
    recorderRef.current?.cancel();
    recorderRef.current = null;
    resetExportEntranceStyles(targetRef.current);
    setAutoReveal(true);
    setIsExporting(false);
    stopPlayback();
  };

  const handleExport = async () => {
    const element = targetRef.current;
    if (!element || messageCount === 0 || isExporting) {
      return;
    }

    if (isPlaying) {
      stopPlayback();
      await waitMs(50);
    }

    setIsExporting(true);
    exportGenerationRef.current += 1;
    const generation = exportGenerationRef.current;

    try {
      // Export drives reveals lockstep with captures — disables timer reveals.
      setAutoReveal(false);
      startPlayback(messageCount, { deferFirst: true });
      await waitAnimationFrame();
      if (generation !== exportGenerationRef.current) {
        return;
      }

      const recorder = await startElementVideoRecording(element, {
        fps: EXPORT_VIDEO_FPS,
        scale,
      });
      if (generation !== exportGenerationRef.current) {
        recorder.cancel();
        setAutoReveal(true);
        stopPlayback();
        return;
      }
      recorderRef.current = recorder;

      const holdAfterEntrance = Math.max(0, gapMs - EXPORT_ENTRANCE_MS);

      for (let index = 0; index < messageCount; index += 1) {
        if (generation !== exportGenerationRef.current) {
          return;
        }
        revealNext();
        await waitAnimationFrame();
        const applyProgress = prepareEntranceFrame(element);
        // Render all 18 animation frames offline with exact 60fps timestamps.
        await recorder.recordFor(EXPORT_ENTRANCE_MS, {
          beforeFrame: applyProgress,
          snapshot: true,
        });
        if (generation !== exportGenerationRef.current) {
          return;
        }
        const holdMs =
          index < messageCount - 1
            ? holdAfterEntrance
            : PLAYBACK_COMPLETE_DELAY_MS;
        // Hold on the settled frame — no DOM snapshots, so UI stays smooth.
        await recorder.recordFor(holdMs, { snapshot: false });
      }

      if (generation !== exportGenerationRef.current) {
        return;
      }

      const blob = await recorder.stop();
      recorderRef.current = null;
      resetExportEntranceStyles(element);
      completePlayback();
      setAutoReveal(true);

      if (generation !== exportGenerationRef.current) {
        return;
      }
      const extension = videoExtensionForMime(blob.type);
      downloadBlob(blob, `gochat-chat-${Date.now()}.${extension}`);
      setIsExporting(false);
    } catch {
      recorderRef.current = null;
      resetExportEntranceStyles(element);
      setAutoReveal(true);
      setIsExporting(false);
      stopPlayback();
    }
  };

  return (
    <div data-slot="studio-chat-export">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {dict.export.label}
      </p>
      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {dict.export.resolution}
          </p>
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatExportVideoSize(scale)}
          </span>
        </div>
        <Select
          value={String(scale)}
          disabled={isExporting}
          onValueChange={(value) => {
            const next = Number(value);
            if (isExportVideoScale(next)) {
              setScale(next);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {`${scale}× · ${formatExportVideoSize(scale)}`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {EXPORT_VIDEO_SCALES.map((item) => (
              <SelectItem key={item} value={String(item)}>
                {`${item}× · ${formatExportVideoSize(item)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant={isExporting ? "default" : "outline"}
        className="w-full"
        disabled={messageCount === 0 && !isExporting}
        onClick={() => {
          if (isExporting) {
            cancelExport();
            return;
          }
          void handleExport();
        }}
      >
        {isExporting ? <LoaderCircle className="animate-spin" /> : <Download />}
        {isExporting ? dict.export.exportingVideo : dict.export.videoButton}
      </Button>
    </div>
  );
};

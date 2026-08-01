"use client";

/* oxlint-disable promise/avoid-new -- rAF / timeout waits for export sequencing */
import { Download, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { useDictionary } from "@/components/i18n/dictionary-provider";
import { Button } from "@/components/ui/button";
import {
  downloadBlob,
  EXPORT_VIDEO_FPS,
  measureElementCaptureMs,
  resolveExportTimeScale,
  speedUpVideoBlob,
  startElementVideoRecording,
  videoExtensionForMime,
} from "@/lib/export-playback-video";
import type { PlaybackVideoRecorder } from "@/lib/export-playback-video";

import { useCatalogStore } from "../hooks/use-catalog-store";
import { useDraftsStore } from "../hooks/use-drafts-store";
import { usePlaybackStore } from "../hooks/use-playback-store";
import { useStudioEvents } from "../lib/studio-kit";
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

export const StudioChatExport = ({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) => {
  const dict = useDictionary();
  const events = useStudioEvents();
  const [isExporting, setIsExporting] = useState(false);
  const recorderRef = useRef<PlaybackVideoRecorder | null>(null);
  const exportGenerationRef = useRef(0);
  const timeScaleRef = useRef(1);

  const selectedId = useCatalogStore((state) => state.selectedId);
  const presets = useCatalogStore((state) => state.presets);
  const byChatId = useDraftsStore((state) => state.byChatId);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const startPlayback = usePlaybackStore((state) => state.startPlayback);
  const stopPlayback = usePlaybackStore((state) => state.stopPlayback);
  const setTimeScale = usePlaybackStore((state) => state.setTimeScale);

  const preset = presets.find((item) => item.id === selectedId);
  const draft = resolveDraft(preset, byChatId);
  const messageCount = draft?.messages.length ?? 0;

  useEffect(() => {
    if (!isExporting) {
      return;
    }
    const unsubscribe = events.on("playbackcomplete", () => {
      const generation = exportGenerationRef.current;
      const timeScale = timeScaleRef.current;
      const tailMs = PLAYBACK_COMPLETE_DELAY_MS / timeScale + 700;
      window.setTimeout(() => {
        void (async () => {
          if (generation !== exportGenerationRef.current) {
            return;
          }
          const recorder = recorderRef.current;
          recorderRef.current = null;
          if (!recorder) {
            setTimeScale(1);
            setIsExporting(false);
            return;
          }
          try {
            const rawBlob = await recorder.stop();
            if (generation !== exportGenerationRef.current) {
              return;
            }
            const blob = await speedUpVideoBlob(
              rawBlob,
              1 / timeScale,
              EXPORT_VIDEO_FPS
            );
            if (generation !== exportGenerationRef.current) {
              return;
            }
            const extension = videoExtensionForMime(blob.type);
            downloadBlob(blob, `gochat-chat-${Date.now()}.${extension}`);
          } catch {
            // User cancelled or browser failed mid-stop.
          } finally {
            setTimeScale(1);
            if (generation === exportGenerationRef.current) {
              setIsExporting(false);
            }
          }
        })();
      }, tailMs);
    });
    return unsubscribe;
  }, [events, isExporting, setTimeScale]);

  const cancelExport = () => {
    exportGenerationRef.current += 1;
    recorderRef.current?.cancel();
    recorderRef.current = null;
    timeScaleRef.current = 1;
    setTimeScale(1);
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
      const captureMs = await measureElementCaptureMs(element);
      if (generation !== exportGenerationRef.current) {
        return;
      }
      const timeScale = resolveExportTimeScale(captureMs, EXPORT_VIDEO_FPS);
      timeScaleRef.current = timeScale;
      setTimeScale(timeScale);

      // Let React apply scaled entrance durations before the first reveal.
      await waitAnimationFrame();
      if (generation !== exportGenerationRef.current) {
        return;
      }

      startPlayback(messageCount);
      await waitAnimationFrame();
      if (generation !== exportGenerationRef.current) {
        return;
      }

      const recorder = await startElementVideoRecording(element, {
        fps: EXPORT_VIDEO_FPS,
      });
      if (generation !== exportGenerationRef.current) {
        recorder.cancel();
        setTimeScale(1);
        return;
      }
      recorderRef.current = recorder;
    } catch {
      timeScaleRef.current = 1;
      setTimeScale(1);
      setIsExporting(false);
      recorderRef.current = null;
      stopPlayback();
    }
  };

  return (
    <div data-slot="studio-chat-export">
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {dict.export.label}
      </p>
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

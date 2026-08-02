/* oxlint-disable eslint/no-await-in-loop -- offline frames must encode serially */
import { getFontEmbedCSS, toCanvas } from "html-to-image";
import {
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
} from "mediabunny";

import { scrollChatMessagesToBottom } from "@/components/chat/chat.helpers";
import {
  buildPhoneCaptureOptions,
  lockChatBubbleLineBreaks,
  lockScrollOffsetsForCapture,
} from "@/lib/export-dom-capture";
import { IPHONE_HEIGHT, IPHONE_WIDTH } from "@/lib/phone-frame";

/** Offline encoding gives every frame an exact timestamp regardless of render time. */
export const EXPORT_VIDEO_FPS = 60;
export const EXPORT_ENTRANCE_MS = 300;

/** Capture scale relative to the 393×852 logical phone frame. */
export const EXPORT_VIDEO_SCALES = [1, 2, 3] as const;
export type ExportVideoScale = (typeof EXPORT_VIDEO_SCALES)[number];
export const DEFAULT_EXPORT_VIDEO_SCALE: ExportVideoScale = 3;

export const isExportVideoScale = (value: number): value is ExportVideoScale =>
  (EXPORT_VIDEO_SCALES as readonly number[]).includes(value);

/** AVC / WebCodecs require even frame dimensions. */
const alignEven = (value: number): number => value + (value % 2);

export const formatExportVideoSize = (scale: ExportVideoScale): string => {
  const width = alignEven(Math.round(IPHONE_WIDTH * scale));
  const height = alignEven(Math.round(IPHONE_HEIGHT * scale));
  return `${width}×${height}`;
};

export interface PlaybackVideoRecorder {
  /**
   * Adds an exact number of timestamped frames. Export may take longer than
   * the resulting video without reducing its frame rate.
   */
  recordFor: (
    durationMs: number,
    options?: {
      snapshot?: boolean;
      beforeFrame?: (progress: number) => void;
    }
  ) => Promise<void>;
  stop: () => Promise<Blob>;
  cancel: () => void;
}

const bitrateForScale = (scale: number): number => {
  // Roughly scale bitrate with pixel count so higher res stays sharp.
  const baseBitrate = 8_000_000;
  return Math.round(baseBitrate * scale * scale);
};

/** Encodes exact 60fps MP4 frames offline using WebCodecs. */
export const startElementVideoRecording = async (
  element: HTMLElement,
  options?: { fps?: number; scale?: ExportVideoScale }
): Promise<PlaybackVideoRecorder> => {
  if (typeof VideoEncoder === "undefined") {
    throw new TypeError("WebCodecs video encoding is not supported");
  }

  const targetFps = options?.fps ?? EXPORT_VIDEO_FPS;
  const pixelRatio = options?.scale ?? DEFAULT_EXPORT_VIDEO_SCALE;
  const frameDurationSeconds = 1 / targetFps;
  // 1× is 393×852 — odd width crashes AVC; pad to even for all scales.
  const width = alignEven(Math.round(IPHONE_WIDTH * pixelRatio));
  const height = alignEven(Math.round(IPHONE_HEIGHT * pixelRatio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true,
  });
  if (!context) {
    throw new Error("Could not create canvas context");
  }

  await document.fonts.ready;
  // Font discovery/embedding is expensive. Compute it once for all frames.
  const fontEmbedCSS = await getFontEmbedCSS(element);
  const captureOptions = buildPhoneCaptureOptions(fontEmbedCSS, pixelRatio);
  let latestFrame: HTMLCanvasElement | null = null;

  const drawLatestFrame = () => {
    if (!latestFrame) {
      return;
    }
    context.drawImage(latestFrame, 0, 0, width, height);
  };

  const snapshot = async () => {
    // Lock wraps from the live preview so html-to-image's font-size hack
    // cannot move the last character up and leave a blank second line.
    const restoreLineBreaks = lockChatBubbleLineBreaks(element);
    // Line-lock can change bubble heights — re-pin before baking scroll.
    scrollChatMessagesToBottom(element);
    // html-to-image clones reset scrollTop — bake offsets into transforms.
    const restoreScroll = lockScrollOffsetsForCapture(element);
    try {
      latestFrame = await toCanvas(element, captureOptions);
      drawLatestFrame();
    } finally {
      restoreScroll();
      restoreLineBreaks();
    }
  };

  const target = new BufferTarget();
  const output = new Output({
    format: new Mp4OutputFormat(),
    target,
  });
  const videoSource = new CanvasSource(canvas, {
    bitrate: bitrateForScale(pixelRatio),
    codec: "avc",
    keyFrameInterval: 2,
  });
  output.addVideoTrack(videoSource, { frameRate: targetFps });
  await output.start();

  await snapshot();

  let cancelled = false;
  let closed = false;
  let frameIndex = 0;

  return {
    cancel: () => {
      if (closed) {
        return;
      }
      cancelled = true;
      closed = true;
      void output.cancel();
    },
    recordFor: async (durationMs, recordOptions) => {
      const shouldSnapshot = recordOptions?.snapshot ?? false;
      const frameCount = Math.max(
        1,
        Math.round((durationMs / 1000) * targetFps)
      );
      for (let localFrame = 0; localFrame < frameCount; localFrame += 1) {
        if (cancelled || closed) {
          return;
        }
        const progress = frameCount === 1 ? 1 : localFrame / (frameCount - 1);
        recordOptions?.beforeFrame?.(progress);
        if (shouldSnapshot) {
          try {
            await snapshot();
          } catch {
            // Keep prior frame.
          }
        }
        drawLatestFrame();
        await videoSource.add(
          frameIndex * frameDurationSeconds,
          frameDurationSeconds,
          { keyFrame: frameIndex % (targetFps * 2) === 0 }
        );
        frameIndex += 1;
      }
    },
    stop: async () => {
      if (cancelled) {
        throw new Error("Recording cancelled");
      }
      if (closed) {
        throw new Error("Recording already closed");
      }
      closed = true;
      await output.finalize();
      if (!target.buffer) {
        throw new Error("Video encoder returned no data");
      }
      return new Blob([target.buffer], { type: "video/mp4" });
    },
  };
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const videoExtensionForMime = (mimeType: string): string =>
  mimeType.includes("mp4") ? "mp4" : "webm";

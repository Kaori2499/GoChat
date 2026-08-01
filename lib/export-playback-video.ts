/* oxlint-disable promise/avoid-new -- MediaRecorder + timers need Promise constructors */
import { toCanvas } from "html-to-image";

import { IPHONE_HEIGHT, IPHONE_WIDTH } from "@/lib/phone-frame";

/** Output / encode frame rate. */
export const EXPORT_VIDEO_FPS = 60;
/** Full retina capture — export is allowed to run slower than realtime. */
const PIXEL_RATIO = 2;
/** Never slow content more than this (1/16 ≈ 16× wall time). */
const MIN_TIME_SCALE = 1 / 16;

const pickRecorderMimeType = (): string => {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  for (const type of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }
  return "video/webm";
};

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

const waitForEvent = (target: EventTarget, eventName: string): Promise<void> =>
  new Promise((resolve) => {
    target.addEventListener(eventName, () => resolve(), { once: true });
  });

type CaptureTrack = MediaStreamTrack & {
  requestFrame?: () => void;
};

export interface PlaybackVideoRecorder {
  stop: () => Promise<Blob>;
  cancel: () => void;
}

const buildCaptureOptions = (width: number, height: number) => ({
  cacheBust: false,
  canvasHeight: height,
  canvasWidth: width,
  height: IPHONE_HEIGHT,
  pixelRatio: PIXEL_RATIO,
  style: {
    height: `${IPHONE_HEIGHT}px`,
    transform: "none",
    width: `${IPHONE_WIDTH}px`,
  },
  width: IPHONE_WIDTH,
});

/** One DOM snapshot; used to pick an export slowdown factor. */
export const measureElementCaptureMs = async (
  element: HTMLElement
): Promise<number> => {
  const width = Math.round(IPHONE_WIDTH * PIXEL_RATIO);
  const height = Math.round(IPHONE_HEIGHT * PIXEL_RATIO);
  const started = performance.now();
  await toCanvas(element, buildCaptureOptions(width, height));
  return Math.max(1, performance.now() - started);
};

/**
 * Slow content so we can take ≥ `fps` unique snapshots per content-second.
 * Example: 100ms/capture → timeScale ≤ 1000/(100*60) ≈ 0.167 (≈6× slower).
 */
export const resolveExportTimeScale = (
  captureMs: number,
  fps: number = EXPORT_VIDEO_FPS
): number => {
  const ideal = 1000 / (captureMs * fps);
  return Math.min(1, Math.max(MIN_TIME_SCALE, ideal));
};

/**
 * Re-encode a recording so it plays `speedFactor`× faster (corrects slow
 * capture wall-clock back to realtime duration) at `fps`.
 */
export const speedUpVideoBlob = async (
  sourceBlob: Blob,
  speedFactor: number,
  fps: number = EXPORT_VIDEO_FPS
): Promise<Blob> => {
  if (speedFactor <= 1.01) {
    return sourceBlob;
  }

  const url = URL.createObjectURL(sourceBlob);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await waitForEvent(video, "loadedmetadata");
    if (!(video.videoWidth > 0 && video.videoHeight > 0)) {
      return sourceBlob;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });
    if (!context) {
      return sourceBlob;
    }

    const stream = canvas.captureStream(fps);
    const track = stream.getVideoTracks()[0] as CaptureTrack | undefined;
    const mimeType = pickRecorderMimeType();
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 12_000_000,
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    video.playbackRate = speedFactor;
    recorder.start(100);
    await video.play();

    let rafId = 0;
    const paint = () => {
      if (!video.paused && !video.ended) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        track?.requestFrame?.();
        rafId = window.requestAnimationFrame(paint);
      }
    };
    rafId = window.requestAnimationFrame(paint);
    await waitForEvent(video, "ended");
    window.cancelAnimationFrame(rafId);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    track?.requestFrame?.();
    await wait(80);

    const blob = await new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: mimeType }));
      };
      try {
        recorder.stop();
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Failed to remux"));
      }
    });
    for (const mediaTrack of stream.getTracks()) {
      mediaTrack.stop();
    }
    return blob;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
};

/** Records an element by sampling canvases onto a MediaRecorder stream. */
export const startElementVideoRecording = async (
  element: HTMLElement,
  options?: { fps?: number }
): Promise<PlaybackVideoRecorder> => {
  if (typeof MediaRecorder === "undefined") {
    throw new TypeError("MediaRecorder is not supported in this browser");
  }

  const targetFps = options?.fps ?? EXPORT_VIDEO_FPS;
  const frameIntervalMs = 1000 / targetFps;
  const width = Math.round(IPHONE_WIDTH * PIXEL_RATIO);
  const height = Math.round(IPHONE_HEIGHT * PIXEL_RATIO);
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

  const captureOptions = buildCaptureOptions(width, height);
  const trackRef: { current: CaptureTrack | undefined } = {
    current: undefined,
  };
  let latestFrame: HTMLCanvasElement | null = null;

  const pushFrame = () => {
    if (!latestFrame) {
      return;
    }
    context.drawImage(latestFrame, 0, 0, width, height);
    trackRef.current?.requestFrame?.();
  };

  latestFrame = await toCanvas(element, captureOptions);
  pushFrame();

  const stream = canvas.captureStream(targetFps);
  trackRef.current = stream.getVideoTracks()[0] as CaptureTrack | undefined;
  trackRef.current?.requestFrame?.();

  const mimeType = pickRecorderMimeType();
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 12_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  let capturingEnabled = true;
  let cancelled = false;
  let closed = false;
  let capturing = false;
  let displayTimerId = 0;
  let captureIdleResolve: (() => void) | null = null;

  const notifyCaptureIdle = () => {
    capturing = false;
    captureIdleResolve?.();
    captureIdleResolve = null;
  };

  const waitForCaptureIdle = (): Promise<void> => {
    if (!capturing) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      captureIdleResolve = resolve;
    });
  };

  /**
   * Capture as fast as possible while content runs slowly. Display loop
   * still emits at `targetFps` so the encoder stays at a fixed rate.
   */
  const scheduleCapture = () => {
    if (!(capturingEnabled && !cancelled)) {
      notifyCaptureIdle();
      return;
    }
    capturing = true;
    void (async () => {
      const started = performance.now();
      try {
        const source = await toCanvas(element, captureOptions);
        if (capturingEnabled && !cancelled) {
          latestFrame = source;
        }
      } catch {
        // Skip failed frames; keep trying.
      }
      // If a capture was faster than one encode frame, yield briefly so we
      // don't starve the main thread / React paints.
      const elapsed = performance.now() - started;
      const yieldMs = Math.max(0, frameIntervalMs * 0.25 - elapsed);
      if (yieldMs > 0) {
        await wait(yieldMs);
      }
      if (capturingEnabled && !cancelled) {
        window.setTimeout(scheduleCapture, 0);
      } else {
        notifyCaptureIdle();
      }
    })();
  };

  const tickDisplay = () => {
    if (closed || cancelled) {
      return;
    }
    pushFrame();
  };

  recorder.start(100);
  displayTimerId = window.setInterval(tickDisplay, Math.round(frameIntervalMs));
  scheduleCapture();
  tickDisplay();

  const finish = (abort: boolean): Promise<Blob> =>
    new Promise((resolve, reject) => {
      if (closed) {
        resolve(new Blob(chunks, { type: mimeType }));
        return;
      }
      closed = true;
      capturingEnabled = false;
      window.clearInterval(displayTimerId);
      if (abort) {
        cancelled = true;
        try {
          if (recorder.state !== "inactive") {
            recorder.stop();
          }
        } catch {
          // ignore
        }
        for (const track of stream.getTracks()) {
          track.stop();
        }
        reject(new Error("Recording cancelled"));
        return;
      }

      recorder.onstop = () => {
        for (const track of stream.getTracks()) {
          track.stop();
        }
        resolve(new Blob(chunks, { type: mimeType }));
      };
      try {
        if (recorder.state === "inactive") {
          resolve(new Blob(chunks, { type: mimeType }));
        } else {
          recorder.stop();
        }
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Failed to stop"));
      }
    });

  return {
    cancel: () => {
      void finish(true);
    },
    stop: async () => {
      capturingEnabled = false;
      await waitForCaptureIdle();
      if (!(cancelled || closed)) {
        try {
          latestFrame = await toCanvas(element, captureOptions);
          pushFrame();
        } catch {
          // ignore final-frame failures
        }
      }
      await wait(80);
      return finish(false);
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

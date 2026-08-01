"use client";

import { useEffect, useLayoutEffect, useState } from "react";

import {
  clampPhoneZoom,
  IPHONE_HEIGHT,
  IPHONE_WIDTH,
  PHONE_ZOOM_STEP,
  resolvePhoneFitScale,
} from "@/lib/phone-frame";

/** Shared across chat/notif so zoom persists when switching modes. */
let sharedZoom = 1;
const zoomListeners = new Set<() => void>();

const notifyZoomListeners = () => {
  for (const listener of zoomListeners) {
    listener();
  }
};

export const usePhonePreviewScale = (): {
  height: number;
  scale: number;
  width: number;
} => {
  const [fitScale, setFitScale] = useState(1);
  const [zoom, setZoom] = useState(sharedZoom);

  useLayoutEffect(() => {
    const updateFit = () => {
      setFitScale(resolvePhoneFitScale());
    };
    updateFit();
    window.addEventListener("resize", updateFit);
    return () => window.removeEventListener("resize", updateFit);
  }, []);

  useEffect(() => {
    const syncZoom = () => {
      setZoom(sharedZoom);
    };
    zoomListeners.add(syncZoom);
    return () => {
      zoomListeners.delete(syncZoom);
    };
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      event.preventDefault();
      const direction = event.deltaY < 0 ? 1 : -1;
      sharedZoom = clampPhoneZoom(sharedZoom + direction * PHONE_ZOOM_STEP);
      notifyZoomListeners();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  const scale = fitScale * zoom;

  return {
    height: IPHONE_HEIGHT * scale,
    scale,
    width: IPHONE_WIDTH * scale,
  };
};

export { IPHONE_HEIGHT, IPHONE_WIDTH };

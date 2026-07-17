/** iPhone 15 / 15 Pro logical viewport (CSS px). */
export const IPHONE_WIDTH = 393
export const IPHONE_HEIGHT = 852

/** Studio chrome: mode toggle + page padding + side panels. */
const VIEWPORT_HEIGHT_GUTTER = 88
const VIEWPORT_WIDTH_GUTTER = 560

export const PHONE_ZOOM_MIN = 0.5
export const PHONE_ZOOM_MAX = 2.5
export const PHONE_ZOOM_STEP = 0.08

export const resolvePhoneFitScale = (): number => {
  if (typeof window === "undefined") {
    return 1
  }
  const maxHeight = window.innerHeight - VIEWPORT_HEIGHT_GUTTER
  const maxWidth = window.innerWidth - VIEWPORT_WIDTH_GUTTER
  return Math.max(
    0.75,
    Math.min(maxHeight / IPHONE_HEIGHT, maxWidth / IPHONE_WIDTH),
  )
}

export const clampPhoneZoom = (zoom: number): number =>
  Math.min(PHONE_ZOOM_MAX, Math.max(PHONE_ZOOM_MIN, zoom))

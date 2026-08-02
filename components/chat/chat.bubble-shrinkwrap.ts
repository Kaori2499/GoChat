/**
 * Multiline chat-bubble shrinkwrap via Pretext.
 * CSS fit-content / max-content leaves dead space after short last lines;
 * Pretext binary-searches the tightest width that keeps the same line count.
 * @see https://chenglou.me/pretext/bubbles/
 */

import {
  layout,
  prepareWithSegments,
  setLocale as setPretextLocale,
  walkLineRanges,
} from "@chenglou/pretext";
import type { PreparedTextWithSegments } from "@chenglou/pretext";

import type { Locale } from "@/lib/i18n/config";
import { IPHONE_WIDTH } from "@/lib/phone-frame";

import { CHAT_FONT } from "./chat.theme";

/** Matches `text-[0.95rem]` at the default 16px root. */
const BUBBLE_FONT_SIZE_PX = 15.2;
/** Matches `font-medium`. */
const BUBBLE_FONT_WEIGHT = 500;
/** Matches `leading-[1.5]`. */
export const BUBBLE_LINE_HEIGHT_PX = BUBBLE_FONT_SIZE_PX * 1.5;
/** Matches bubble `px-3`. */
export const BUBBLE_PADDING_X = 12;
/** Matches messages list `px-3`. */
const MESSAGES_PADDING_X = 12;
/** Matches own-message `max-w-[80%]`. */
const OWN_MAX_RATIO = 0.8;
/** Matches received-message `max-w-[68%]`. */
const RECEIVED_MAX_RATIO = 0.68;

const PRETEXT_LOCALE: Record<Locale, string> = {
  en: "en",
  ja: "ja",
  zh: "zh-CN",
};

let activePretextLocale: string | null = null;

/** Sync Pretext's segmenter locale once per app locale (clears its cache). */
export const syncBubblePretextLocale = (locale: Locale): void => {
  const next = PRETEXT_LOCALE[locale];
  if (activePretextLocale === next) {
    return;
  }
  activePretextLocale = next;
  setPretextLocale(next);
};

/** Canvas `font` shorthand synced with bubble text CSS. */
export const BUBBLE_CANVAS_FONT = `${BUBBLE_FONT_WEIGHT} ${BUBBLE_FONT_SIZE_PX}px ${CHAT_FONT}`;

export const getBubbleMaxOuterWidth = (isOwn: boolean): number => {
  const contentWidth = IPHONE_WIDTH - MESSAGES_PADDING_X * 2;
  return contentWidth * (isOwn ? OWN_MAX_RATIO : RECEIVED_MAX_RATIO);
};

export const getBubbleMaxContentWidth = (isOwn: boolean): number =>
  Math.max(1, getBubbleMaxOuterWidth(isOwn) - BUBBLE_PADDING_X * 2);

const collectMaxLineWidth = (
  prepared: PreparedTextWithSegments,
  maxWidth: number
): { lineCount: number; maxLineWidth: number } => {
  let maxLineWidth = 0;
  const lineCount = walkLineRanges(prepared, maxWidth, (line) => {
    if (line.width > maxLineWidth) {
      maxLineWidth = line.width;
    }
  });
  return { lineCount, maxLineWidth };
};

/** Tightest content width that still wraps to the same line count as `maxWidth`. */
export const findTightContentWidth = (
  prepared: PreparedTextWithSegments,
  maxWidth: number
): number => {
  const initial = collectMaxLineWidth(prepared, maxWidth);
  if (initial.lineCount <= 0) {
    return 0;
  }

  let lo = 1;
  let hi = Math.max(1, Math.ceil(maxWidth));

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const { lineCount } = layout(prepared, mid, BUBBLE_LINE_HEIGHT_PX);
    if (lineCount <= initial.lineCount) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  return collectMaxLineWidth(prepared, lo).maxLineWidth;
};

/**
 * Outer bubble width (content + horizontal padding) for shrinkwrapped text.
 * Returns `null` when measurement is unavailable (SSR / empty).
 */
export const measureBubbleOuterWidth = (
  text: string,
  isOwn: boolean
): number | null => {
  if (typeof document === "undefined") {
    return null;
  }
  if (!text) {
    return null;
  }

  const prepared = prepareWithSegments(text, BUBBLE_CANVAS_FONT, {
    whiteSpace: "pre-wrap",
  });
  const contentMax = getBubbleMaxContentWidth(isOwn);
  const tightContent = findTightContentWidth(prepared, contentMax);
  return Math.ceil(tightContent) + BUBBLE_PADDING_X * 2;
};

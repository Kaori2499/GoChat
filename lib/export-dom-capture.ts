/**
 * html-to-image (v1.11) copies computed styles onto the clone and:
 * - shrinks every font-size via `floor(px) - 0.1` (text reflows looser)
 * - freezes used `height` (keeps a blank second line after reflow)
 * It also has no `onclone` hook in this version.
 *
 * Fix: before capture, rewrite bubble text with explicit `\n` at the live
 * visual wrap points so export line breaks match the preview. Also re-apply
 * Pretext shrinkwrap widths — never freeze from getBoundingClientRect, which
 * includes the studio phone `scale()` and inflates bubbles (trailing gap).
 */

import {
  measureBubbleOuterWidth,
  syncBubblePretextLocale,
} from "@/components/chat/chat.bubble-shrinkwrap";
import { defaultLocale } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import { IPHONE_HEIGHT, IPHONE_WIDTH } from "@/lib/phone-frame";

/**
 * Per-character glyph rects can jitter by a sub-pixel amount even within the
 * same visual line (antialiasing, hinting, mixed-script ascent differences).
 * A fixed sub-pixel threshold misreads that jitter as a wrap and splits off
 * the last character of otherwise single-line text (e.g. "aaa", "中文").
 * `getClientRects()` on the *whole* text node returns exactly one rect per
 * visual line, so it is used as ground truth for how many lines actually
 * exist; the per-character walk below is only trusted to find split points
 * and is never allowed to produce more lines than that ground truth.
 */
export const readElementVisualLines = (el: HTMLElement): string[] => {
  const text = el.textContent ?? "";
  if (!text) {
    return [];
  }

  const textNode = el.firstChild;
  if (
    !(textNode instanceof Text) ||
    textNode.textContent !== text ||
    el.childNodes.length !== 1
  ) {
    return text.split("\n");
  }

  const fullRange = document.createRange();
  fullRange.setStart(textNode, 0);
  fullRange.setEnd(textNode, text.length);
  const visualLineCount = fullRange.getClientRects().length;

  // Single visual line: never split, sidesteps sub-pixel rect noise entirely.
  if (visualLineCount <= 1) {
    return [text];
  }

  const lines: string[] = [];
  let current = "";
  let currentLineTop: number | null = null;
  let maxGlyphHeight = 0;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index] ?? "";
    const range = document.createRange();
    range.setStart(textNode, index);
    range.setEnd(textNode, index + 1);
    const rect = range.getClientRects().item(0);
    if (!rect) {
      current += character;
      continue;
    }
    maxGlyphHeight = Math.max(maxGlyphHeight, rect.height);
    // Real line transitions move a full line-height; require more than half
    // of that before treating it as a new line, so mixed-script/antialiasing
    // jitter on the same line can't get misread as a wrap.
    const threshold = Math.max(4, maxGlyphHeight * 0.5);
    const canStartNewLine = lines.length + 1 < visualLineCount;
    const startsNewLine =
      currentLineTop !== null &&
      canStartNewLine &&
      rect.top - currentLineTop > threshold;
    if (startsNewLine) {
      lines.push(current);
      current = character;
      currentLineTop = rect.top;
    } else {
      current += character;
      currentLineTop =
        currentLineTop === null ? rect.top : Math.min(currentLineTop, rect.top);
    }
  }

  if (current.length > 0 || lines.length === 0) {
    lines.push(current);
  }
  return lines;
};

const resolveDocumentLocale = (): Locale => {
  const { lang } = document.documentElement;
  if (lang === "en" || lang === "ja" || lang === "zh") {
    return lang;
  }
  return defaultLocale;
};

const resolveBubbleIsOwn = (bubble: HTMLElement): boolean =>
  bubble.dataset.chatOwn !== undefined;

/** Pin Pretext shrinkwrap widths (layout px, not scaled screen px). */
const freezeBubbleShrinkwrapWidths = (
  root: HTMLElement,
  widthBackups: { el: HTMLElement; width: string }[]
): void => {
  syncBubblePretextLocale(resolveDocumentLocale());

  for (const bubble of root.querySelectorAll<HTMLElement>(
    "[data-chat-bubble]"
  )) {
    widthBackups.push({ el: bubble, width: bubble.style.width });
    const textEl = bubble.querySelector<HTMLElement>("[data-chat-bubble-text]");
    const text = textEl?.textContent ?? "";
    const measured = measureBubbleOuterWidth(text, resolveBubbleIsOwn(bubble));
    // Prefer Pretext; fall back to layout offsetWidth (ignores CSS transforms).
    bubble.style.width = `${measured ?? bubble.offsetWidth}px`;
  }
};

/** Pin bubble wraps to the live layout; returns a restore callback. */
export const lockChatBubbleLineBreaks = (root: HTMLElement): (() => void) => {
  const widthBackups: { el: HTMLElement; width: string }[] = [];
  const textBackups: {
    el: HTMLElement;
    text: string | null;
    whiteSpace: string;
  }[] = [];

  // Shrinkwrap first so capture never freezes a scale()-inflated screen width
  // (that was recreating the large trailing gap in exported video frames).
  freezeBubbleShrinkwrapWidths(root, widthBackups);

  for (const el of root.querySelectorAll<HTMLElement>(
    "[data-chat-bubble-text]"
  )) {
    const lines = readElementVisualLines(el);
    if (lines.length === 0) {
      continue;
    }
    const text = el.textContent;
    const locked = lines.join("\n");
    textBackups.push({ el, text, whiteSpace: el.style.whiteSpace });
    if (locked !== text) {
      el.textContent = locked;
    }
    // `pre` renders the locked breaks verbatim — the capture clone freezes
    // fractional widths, and any re-wrap there can push the last glyph
    // (e.g. 话) onto a phantom second row.
    el.style.whiteSpace = "pre";
  }

  return () => {
    for (const backup of textBackups) {
      if (backup.el.textContent !== backup.text) {
        backup.el.textContent = backup.text;
      }
      backup.el.style.whiteSpace = backup.whiteSpace;
    }
    for (const backup of widthBackups) {
      backup.el.style.width = backup.width;
    }
  };
};

/**
 * html-to-image clones DOM without copying scrollTop/scrollLeft, so overflow
 * containers reset to the top in captured frames. Bake scroll into a content
 * transform before capture, then restore.
 */
export const lockScrollOffsetsForCapture = (
  root: HTMLElement
): (() => void) => {
  const restores: (() => void)[] = [];

  const bake = (el: HTMLElement) => {
    if (el.scrollTop === 0 && el.scrollLeft === 0) {
      return;
    }
    const inner = el.firstElementChild;
    if (!(inner instanceof HTMLElement)) {
      return;
    }
    const { scrollLeft, scrollTop } = el;
    const prevTransform = inner.style.transform;
    const prevOverflow = el.style.overflow;
    const prevBehavior = el.style.scrollBehavior;
    // Instant — smooth scroll would animate scrollTop=0 and fight the bake.
    el.style.scrollBehavior = "auto";
    inner.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`;
    el.style.overflow = "hidden";
    el.scrollTop = 0;
    el.scrollLeft = 0;
    restores.push(() => {
      inner.style.transform = prevTransform;
      el.style.overflow = prevOverflow;
      el.scrollTop = scrollTop;
      el.scrollLeft = scrollLeft;
      el.style.scrollBehavior = prevBehavior;
    });
  };

  for (const el of root.querySelectorAll<HTMLElement>("*")) {
    bake(el);
  }
  bake(root);

  return () => {
    for (const restore of restores) {
      restore();
    }
  };
};

export const buildPhoneCaptureOptions = (
  fontEmbedCSS: string,
  pixelRatio: number,
  extras?: Record<string, unknown>
) => ({
  cacheBust: false,
  fontEmbedCSS,
  height: IPHONE_HEIGHT,
  pixelRatio,
  style: {
    height: `${IPHONE_HEIGHT}px`,
    transform: "none",
    width: `${IPHONE_WIDTH}px`,
  },
  width: IPHONE_WIDTH,
  ...extras,
});

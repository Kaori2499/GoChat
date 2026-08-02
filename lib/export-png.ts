import { getFontEmbedCSS, toPng } from "html-to-image";

import { scrollChatMessagesToBottom } from "@/components/chat/chat.helpers";
import {
  buildPhoneCaptureOptions,
  lockChatBubbleLineBreaks,
  lockScrollOffsetsForCapture,
} from "@/lib/export-dom-capture";

export const downloadElementPng = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  await document.fonts.ready;
  const fontEmbedCSS = await getFontEmbedCSS(element);
  const restoreLineBreaks = lockChatBubbleLineBreaks(element);
  scrollChatMessagesToBottom(element);
  const restoreScroll = lockScrollOffsetsForCapture(element);
  try {
    const dataUrl = await toPng(
      element,
      buildPhoneCaptureOptions(fontEmbedCSS, 2, { cacheBust: true })
    );

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    restoreScroll();
    restoreLineBreaks();
  }
};

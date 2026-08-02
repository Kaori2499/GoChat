import { getFontEmbedCSS, toPng } from "html-to-image";

import {
  buildPhoneCaptureOptions,
  lockChatBubbleLineBreaks,
} from "@/lib/export-dom-capture";

export const downloadElementPng = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  await document.fonts.ready;
  const fontEmbedCSS = await getFontEmbedCSS(element);
  const restoreLineBreaks = lockChatBubbleLineBreaks(element);
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
    restoreLineBreaks();
  }
};

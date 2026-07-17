import { toPng } from "html-to-image";

import { IPHONE_HEIGHT, IPHONE_WIDTH } from "@/lib/phone-frame";

export const downloadElementPng = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    height: IPHONE_HEIGHT,
    pixelRatio: 2,
    style: {
      height: `${IPHONE_HEIGHT}px`,
      transform: "none",
      width: `${IPHONE_WIDTH}px`,
    },
    width: IPHONE_WIDTH,
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

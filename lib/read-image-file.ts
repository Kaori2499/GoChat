/** Max long-edge for chat image messages (keeps localStorage drafts manageable). */
const MAX_IMAGE_EDGE = 1200;
const JPEG_QUALITY = 0.85;

const loadImageFromFile = (file: File): Promise<HTMLImageElement> =>
  // oxlint-disable-next-line promise/avoid-new -- FileReader + Image decode
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", () => {
      reject(new Error("Failed to read image file"));
    });
    reader.addEventListener("load", () => {
      const { result } = reader;
      if (typeof result !== "string") {
        reject(new Error("Unexpected file reader result"));
        return;
      }
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", () => {
        reject(new Error("Failed to decode image"));
      });
      image.src = result;
    });
    reader.readAsDataURL(file);
  });

const prefersAlpha = (mimeType: string): boolean =>
  mimeType === "image/png" ||
  mimeType === "image/webp" ||
  mimeType === "image/gif";

/** Reads an image file and returns a resized data URL (PNG keeps transparency). */
export const readImageFileAsDataUrl = async (file: File): Promise<string> => {
  if (!file.type.startsWith("image/")) {
    throw new TypeError("Selected file is not an image");
  }
  const image = await loadImageFromFile(file);
  const longEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longEdge > MAX_IMAGE_EDGE ? MAX_IMAGE_EDGE / longEdge : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not create canvas context");
  }
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  if (prefersAlpha(file.type)) {
    return canvas.toDataURL("image/png");
  }
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
};

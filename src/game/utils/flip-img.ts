export function createMirrorImage(
  originalImg: HTMLImageElement
): HTMLCanvasElement | null {
  if (!originalImg) return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = originalImg.width;
  canvas.height = originalImg.height;

  if (!ctx) return null;
  ctx.translate(originalImg.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(originalImg, 0, 0);

  return canvas;
}

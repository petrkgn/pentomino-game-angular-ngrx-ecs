import { CanvasCtx } from "./canvas-ctx";

export type CanvasParams = {
  ctx: CanvasCtx | null;
  canvasCenter: { x: number; y: number };
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
};

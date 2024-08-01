import { ElementRef } from "@angular/core";

export type CanvasParams = {
  ctx?: CanvasRenderingContext2D | null;
  canvasCenter?: { x: number; y: number };
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
};

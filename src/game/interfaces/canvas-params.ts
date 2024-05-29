import { ElementRef } from "@angular/core";

export interface CanvasParams {
  ctx: CanvasRenderingContext2D | null;
  canvasCenter: { x: number; y: number };
  width: number;
  height: number;
  canvasEl: HTMLCanvasElement;
}

import { ElementRef } from "@angular/core";

export interface CanvasParams {
  ctx: CanvasRenderingContext2D | null;
  canvasPositionTop: number;
  canvasPositionLeft: number;
  width: number;
  height: number;
  canvasEl: HTMLCanvasElement;
}

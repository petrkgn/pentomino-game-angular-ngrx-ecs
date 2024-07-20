// render-params.interface.ts
import { Entity } from "../types/entity";

export interface RenderParams {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  shapes: Entity[];
  img: HTMLImageElement;
  imgWidth: number;
  imgHeight: number;
}

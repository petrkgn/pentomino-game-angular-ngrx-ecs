import { inject, Injectable } from "@angular/core";
import { animationFrameScheduler } from "rxjs";

import { PickComponentType } from "../types/components";
import { ComponentType } from "../constants/component-type.enum";
import { CanvasParams } from "../types/canvas-params";
import { Entity } from "../types/entity";
import { AssetStore } from "../store/assets/asset-srore";

@Injectable({
  providedIn: "root",
})
export class ShapesPackRenderService {
  private readonly assetStore = inject(AssetStore);
  private offscreenCanvas: HTMLCanvasElement;

  constructor() {
    this.offscreenCanvas = document.createElement("canvas");
  }

  renderShapesPack(params: CanvasParams, shapes: Entity[]): void {
    const { ctx, canvas, width, height } = params;

    if (!ctx || !shapes.length) {
      this.clearCanvas(ctx, canvas);
      return;
    }

    animationFrameScheduler.schedule(
      function (actions) {
        this.schedule(actions);
      },
      0,
      this.renderAllCurrentShapes(shapes, ctx, canvas, width, height)
    );
  }

  private renderAllCurrentShapes(
    shapes: Entity[],
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    width: number,
    height: number
  ): void {
    this.prepareOffscreenCanvas(width, height);
    const offscreenCtx = this.offscreenCanvas.getContext("2d")!;

    shapes.every((shape) => this.renderShape(shape, offscreenCtx));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.offscreenCanvas, 0, 0, canvas.width, canvas.height);
  }

  private renderShape(shape: Entity, ctx: CanvasRenderingContext2D): void {
    const { hintBox, viewComponent } = this.getShapeComponents(shape);

    if (!hintBox || !viewComponent) {
      return;
    }

    const asset = this.assetStore.entityMap()[viewComponent.img];

    if (!asset) return;

    ctx.save();
    ctx.drawImage(
      asset.img,
      hintBox.x + hintBox.width / 4,
      hintBox.y + hintBox.height / 4,
      hintBox.width / 2,
      hintBox.height / 2
    );
    ctx.restore();
  }

  private getShapeComponents(shape: Entity) {
    return {
      hintBox: shape.components.entities[
        ComponentType.HINT_BOX
      ] as PickComponentType<ComponentType.HINT_BOX>,
      viewComponent: shape.components.entities[
        ComponentType.VIEW
      ] as PickComponentType<ComponentType.VIEW>,
    };
  }

  private prepareOffscreenCanvas(width: number, height: number): void {
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    const ctx = this.offscreenCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, width, height);
  }

  private clearCanvas(
    ctx: CanvasRenderingContext2D | null,
    canvas: HTMLCanvasElement
  ): void {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

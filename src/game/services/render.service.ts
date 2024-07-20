import { inject, Injectable } from "@angular/core";
import { animationFrameScheduler } from "rxjs";

import { PickComponentType } from "../types/components";
import { ComponentType } from "../constants/component-type.enum";
import { CanvasParams } from "../types/canvas-params";
import { Entity } from "../types/entity";
import { AssetStore } from "../store/assets/asset-srore";
import { CELL_SIZE } from "../constants/cell-size";

@Injectable({
  providedIn: "root",
})
export class RenderService {
  private readonly assetStore = inject(AssetStore);
  private offscreenCanvas: HTMLCanvasElement;

  constructor() {
    this.offscreenCanvas = document.createElement("canvas");
  }

  renderCurrentShapes(params: CanvasParams, shapes: Entity[]): void {
    const { ctx, canvas, width, height } = params;

    if (!ctx || !shapes.length) {
      this.clearCanvasIfNoShapes(ctx, canvas);
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
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    const offscreenCtx = this.offscreenCanvas.getContext("2d")!;

    offscreenCtx.clearRect(0, 0, width, height);

    shapes.forEach((shape) => {
      const {
        rotateComponent,
        positionComponent,
        isMirror,
        shapeView,
        shapeMatrix,
        shapeRatio,
      } = this.getShapeComponents(shape);

      if (!positionComponent || !rotateComponent) {
        return;
      }

      const asset = this.assetStore.entityMap()[shapeView.img];
      const imgWidth =
        (shapeMatrix.matrix.length / shapeMatrix.rows) *
        CELL_SIZE *
        shapeRatio.ratio;
      const imgHeight = shapeMatrix.rows * CELL_SIZE * shapeRatio.ratio;

      this.renderShape(
        offscreenCtx,
        this.offscreenCanvas,
        asset.img,
        imgWidth,
        imgHeight,
        positionComponent,
        rotateComponent,
        isMirror
      );
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.offscreenCanvas, 0, 0, canvas.width, canvas.height);
  }

  private getShapeComponents(shape: any) {
    return {
      rotateComponent: shape.components.entities[
        ComponentType.ROTATE
      ] as PickComponentType<ComponentType.ROTATE>,
      positionComponent: shape.components.entities[
        ComponentType.POSITION
      ] as PickComponentType<ComponentType.POSITION>,
      isMirror: shape.components.entities[
        ComponentType.IS_MIRROR_TAG
      ] as PickComponentType<ComponentType.IS_MIRROR_TAG>,
      shapeView: shape.components.entities[
        ComponentType.VIEW
      ] as PickComponentType<ComponentType.VIEW>,
      shapeMatrix: shape.components.entities[
        ComponentType.MATRIX
      ] as PickComponentType<ComponentType.MATRIX>,
      shapeRatio: shape.components.entities[
        ComponentType.RATIO
      ] as PickComponentType<ComponentType.RATIO>,
    };
  }

  private clearCanvasIfNoShapes(
    ctx: CanvasRenderingContext2D | null,
    canvas: HTMLCanvasElement
  ): void {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  private renderShape(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    imgWidth: number,
    imgHeight: number,
    positionComponent: PickComponentType<ComponentType.POSITION>,
    rotateComponent: PickComponentType<ComponentType.ROTATE>,
    isMirror: PickComponentType<ComponentType.IS_MIRROR_TAG> | undefined
  ): void {
    const angle = rotateComponent.angle;
    const x = positionComponent.x;
    const y = positionComponent.y;

    const positionX = x - canvas.getBoundingClientRect().left;
    const positionY = y - canvas.getBoundingClientRect().top;

    ctx.save();
    ctx.translate(positionX, positionY);
    ctx.rotate((angle * Math.PI) / 180);

    if (isMirror) {
      this.applyMirrorEffect(ctx, angle);
    }

    this.drawImage(ctx, img, imgWidth, imgHeight, angle);

    ctx.restore();
  }

  private applyMirrorEffect(
    ctx: CanvasRenderingContext2D,
    angle: number
  ): void {
    if (angle === 0 || angle === 180) {
      ctx.scale(-1, 1);
    } else {
      ctx.scale(1, -1);
    }
  }

  private drawImage(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    imgWidth: number,
    imgHeight: number,
    angle: number
  ): void {
    if (angle === 90 || angle === 270) {
      ctx.drawImage(img, -imgHeight / 2, -imgWidth / 2, imgHeight, imgWidth);
    } else {
      ctx.drawImage(img, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);
    }
  }
}

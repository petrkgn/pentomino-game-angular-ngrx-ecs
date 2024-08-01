import { inject, Injectable } from "@angular/core";
import { PickComponentType } from "../types/components";
import { ComponentType } from "../constants/component-type.enum";
import { CanvasParams } from "../types/canvas-params";
import { Entity } from "../types/entity";
import { CELL_SIZE } from "../constants/cell-size";
import { AssetStore } from "../store/assets/asset-srore";

@Injectable({
  providedIn: "root",
})
export class RenderService {
  private readonly assetStore = inject(AssetStore);
  private offscreenCanvas: OffscreenCanvas;

  constructor() {
    const { innerWidth: width, innerHeight: height } = window;
    this.offscreenCanvas = new OffscreenCanvas(width, height);
  }

  /**
   * Render current shapes on the main canvas.
   * @param params - Parameters containing the main canvas and its dimensions.
   * @param shapes - Array of entities to be rendered.
   */
  renderCurrentShapes(params: CanvasParams, shapes: Entity[]): void {
    const { canvas, width, height } = params;
    const ctx = canvas.getContext("bitmaprenderer");

    if (!ctx) {
      console.warn("Main canvas context is null, cannot render shapes");
      return;
    }

    if (!shapes.length) {
      this.clearCanvas(ctx, width, height);
      return;
    }

    requestAnimationFrame(() => {
      this.renderAllCurrentShapes(shapes, ctx, width, height);
    });
  }

  private renderAllCurrentShapes(
    shapes: Entity[],
    ctx: ImageBitmapRenderingContext,
    width: number,
    height: number
  ): void {
    this.prepareOffscreenCanvas(width, height);
    const offscreenCtx = this.offscreenCanvas.getContext("2d");

    if (!offscreenCtx) {
      console.error("Offscreen canvas context not available");
      return;
    }

    shapes.forEach((shape) => this.renderShape(offscreenCtx, shape));

    const bitmap = this.offscreenCanvas.transferToImageBitmap();
    ctx.transferFromImageBitmap(bitmap);
  }

  private renderShape(
    ctx: OffscreenCanvasRenderingContext2D,
    shape: Entity
  ): void {
    const components = this.getShapeComponents(shape);

    if (
      !components.positionComponent ||
      !components.rotateComponent ||
      !components.shapeView ||
      !components.shapeMatrix ||
      !components.shapeRatio
    ) {
      return;
    }

    if (!components.shapeView.img) return;

    const asset = this.assetStore.entityMap()[components.shapeView.img];

    const imgWidth =
      (components.shapeMatrix.matrix.length / components.shapeMatrix.rows) *
      CELL_SIZE *
      components.shapeRatio.ratio;
    const imgHeight =
      components.shapeMatrix.rows * CELL_SIZE * components.shapeRatio.ratio;

    this.drawTransformedShape(
      ctx,
      asset.img,
      imgWidth,
      imgHeight,
      components.positionComponent,
      components.rotateComponent,
      components.isMirror
    );
  }

  private getShapeComponents(shape: Entity) {
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

  private prepareOffscreenCanvas(width: number, height: number): void {
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    const ctx = this.offscreenCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    } else {
      console.error("Offscreen canvas context not available for clearing");
    }
  }

  private clearCanvas(
    ctx: ImageBitmapRenderingContext,
    width: number,
    height: number
  ): void {
    const offscreenCanvas = new OffscreenCanvas(width, height);
    const offscreenCtx = offscreenCanvas.getContext("2d");
    if (offscreenCtx) {
      offscreenCtx.clearRect(0, 0, width, height);
      const emptyBitmap = offscreenCanvas.transferToImageBitmap();
      ctx.transferFromImageBitmap(emptyBitmap);
    } else {
      console.error("Offscreen canvas context not available for clearing");
    }
  }

  private drawTransformedShape(
    ctx: OffscreenCanvasRenderingContext2D,
    img: HTMLImageElement,
    imgWidth: number,
    imgHeight: number,
    positionComponent: PickComponentType<ComponentType.POSITION>,
    rotateComponent: PickComponentType<ComponentType.ROTATE>,
    isMirror: PickComponentType<ComponentType.IS_MIRROR_TAG> | undefined
  ): void {
    const { x: posX, y: posY } = positionComponent;
    const { angle } = rotateComponent;

    ctx.save();
    ctx.translate(posX, posY);
    ctx.rotate((angle * Math.PI) / 180);

    if (isMirror) {
      this.applyMirrorEffect(ctx, angle);
    }

    this.drawImage(ctx, img, imgWidth, imgHeight, angle);
    ctx.restore();
  }

  private applyMirrorEffect(
    ctx: OffscreenCanvasRenderingContext2D,
    angle: number
  ): void {
    if (angle === 0 || angle === 180) {
      ctx.scale(-1, 1);
    } else {
      ctx.scale(1, -1);
    }
  }

  private drawImage(
    ctx: OffscreenCanvasRenderingContext2D,
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

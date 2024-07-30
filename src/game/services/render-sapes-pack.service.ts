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

    shapes.forEach((shape) => this.renderShape(shape, offscreenCtx));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.offscreenCanvas, 0, 0, canvas.width, canvas.height);
  }

  private renderShape(shape: Entity, ctx: CanvasRenderingContext2D): void {
    const { hintBox, viewComponent, shapeMatrix } =
      this.getShapeComponents(shape);

    if (!hintBox || !viewComponent.img) {
      return;
    }

    const asset = this.assetStore.entityMap()[viewComponent.img];
    if (!asset) return;

    const matrixComponent = shapeMatrix;
    const maxSize = 5; // Максимальный размер матрицы 5x5
    const cellSize = CELL_SIZE; // Размер ячейки

    // Фактический размер фигуры
    const shapeWidth =
      (matrixComponent.matrix.length / matrixComponent.rows) * cellSize;
    const shapeHeight = matrixComponent.rows * cellSize;

    // Размер области для нормализации
    const normalizedSize = maxSize * cellSize;

    // Масштабирование, чтобы фигура вписывалась в нормализованную область
    const scale = Math.min(
      hintBox.width / normalizedSize,
      hintBox.height / normalizedSize
    );

    const scaledWidth = shapeWidth * scale;
    const scaledHeight = shapeHeight * scale;

    // Центрирование фигуры в hintBox
    const offsetX = hintBox.x + (hintBox.width - scaledWidth) / 2;
    const offsetY = hintBox.y + (hintBox.height - scaledHeight) / 2;

    ctx.save();
    ctx.drawImage(asset.img, offsetX, offsetY, scaledWidth, scaledHeight);
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
      shapeMatrix: shape.components.entities[
        ComponentType.MATRIX
      ] as PickComponentType<ComponentType.MATRIX>,
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

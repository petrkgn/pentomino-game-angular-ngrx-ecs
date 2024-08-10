import { inject, Injectable } from "@angular/core";
import { PickComponentType } from "../types/components";
import { ComponentType } from "../constants/component-type.enum";
import { CanvasParams } from "../types/canvas-params";
import { Entity } from "../types/entity";
import { CELL_SIZE } from "../constants/cell-size";
import { AssetStore } from "../store/assets/asset-srore";
import { CanvasCtx } from "../types/canvas-ctx";

/**
 * Сервис для рендеринга форм на канвасе.
 */
@Injectable()
export class RenderService {
  private readonly assetStore = inject(AssetStore);
  private offscreenCanvas: OffscreenCanvas;

  constructor() {
    const { innerWidth: width, innerHeight: height } = window;
    this.offscreenCanvas = new OffscreenCanvas(width, height);
  }

  /**
   * Рендеринг текущих форм на основном канвасе.
   * @param params - Параметры, содержащие основной канвас и его размеры.
   * @param shapes - Массив сущностей для рендеринга.
   */
  renderCurrentShapes(params: CanvasParams, shapes: Entity[]): void {
    const { ctx, width, height } = params;
    if (!ctx || !this.isSupportedContext(ctx)) {
      console.warn("Контекст основного канваса null или не поддерживается");
      return;
    }

    if (!shapes.length) {
      this.clearCanvas(ctx as ImageBitmapRenderingContext, width, height);
      return;
    }

    requestAnimationFrame(() => {
      this.renderAllCurrentShapes(
        shapes,
        ctx as ImageBitmapRenderingContext,
        width,
        height
      );
    });
  }

  /**
   * Проверяет, является ли контекст канваса поддерживаемым.
   * @param ctx - Контекст канваса для проверки.
   * @returns {boolean} - Возвращает true, если контекст поддерживается, иначе false.
   */
  private isSupportedContext(ctx: CanvasCtx): boolean {
    return ctx instanceof ImageBitmapRenderingContext;
  }

  /**
   * Рендерит все текущие формы на оффскрин канвасе и переносит результат на основной канвас.
   * @param shapes - Массив сущностей для рендеринга.
   * @param ctx - Контекст основного канваса.
   * @param width - Ширина канваса.
   * @param height - Высота канваса.
   */
  private renderAllCurrentShapes(
    shapes: Entity[],
    ctx: ImageBitmapRenderingContext,
    width: number,
    height: number
  ): void {
    this.prepareOffscreenCanvas(width, height);
    const offscreenCtx = this.offscreenCanvas.getContext("2d");

    if (!offscreenCtx) {
      console.error("Контекст оффскрин канваса недоступен");
      return;
    }

    shapes.forEach((shape) => this.renderShape(offscreenCtx, shape));
    const bitmap = this.offscreenCanvas.transferToImageBitmap();
    ctx.transferFromImageBitmap(bitmap);
  }

  /**
   * Рендерит отдельную форму на оффскрин канвасе.
   * @param ctx - Контекст оффскрин канваса.
   * @param shape - Сущность формы для рендеринга.
   */
  private renderShape(
    ctx: OffscreenCanvasRenderingContext2D,
    shape: Entity
  ): void {
    const components = this.getShapeComponents(shape);

    if (!this.areComponentsValid(components) || !components.shapeView.img) {
      return;
    }

    const asset = this.assetStore.entityMap()[components.shapeView.img];
    const imgDimensions = this.calculateImageDimensions(components);

    this.drawTransformedShape(
      ctx,
      asset.img,
      imgDimensions.width,
      imgDimensions.height,
      components.positionComponent,
      components.rotateComponent,
      components.isMirror
    );
  }

  /**
   * Получает компоненты формы.
   * @param shape - Сущность формы.
   * @returns {object} - Возвращает объект с компонентами формы.
   */
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

  /**
   * Проверяет, являются ли компоненты формы валидными.
   * @param components - Компоненты формы.
   * @returns {boolean} - Возвращает true, если компоненты валидны, иначе false.
   */
  private areComponentsValid(
    components: ReturnType<typeof this.getShapeComponents>
  ): boolean {
    return !!(
      components.positionComponent &&
      components.rotateComponent &&
      components.shapeView &&
      components.shapeMatrix &&
      components.shapeRatio &&
      components.shapeView.img
    );
  }

  /**
   * Вычисляет размеры изображения формы.
   * @param components - Компоненты формы.
   * @returns {object} - Возвращает объект с шириной и высотой изображения.
   */
  private calculateImageDimensions(
    components: ReturnType<typeof this.getShapeComponents>
  ): { width: number; height: number } {
    const imgWidth =
      (components.shapeMatrix.matrix.length / components.shapeMatrix.rows) *
      CELL_SIZE *
      components.shapeRatio.ratio;
    const imgHeight =
      components.shapeMatrix.rows * CELL_SIZE * components.shapeRatio.ratio;

    return { width: imgWidth, height: imgHeight };
  }

  /**
   * Подготавливает оффскрин канвас для рендеринга.
   * @param width - Ширина канваса.
   * @param height - Высота канваса.
   */
  private prepareOffscreenCanvas(width: number, height: number): void {
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    const ctx = this.offscreenCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    } else {
      console.error("Контекст оффскрин канваса недоступен для очистки");
    }
  }

  /**
   * Очищает основной канвас.
   * @param ctx - Контекст основного канваса.
   * @param width - Ширина канваса.
   * @param height - Высота канваса.
   */
  private clearCanvas(
    ctx: ImageBitmapRenderingContext,
    width: number,
    height: number
  ): void {
    this.prepareOffscreenCanvas(width, height);
    const emptyBitmap = this.offscreenCanvas.transferToImageBitmap();
    ctx.transferFromImageBitmap(emptyBitmap);
  }

  /**
   * Рисует трансформированную форму на канвасе.
   * @param ctx - Контекст оффскрин канваса.
   * @param img - Изображение формы.
   * @param imgWidth - Ширина изображения.
   * @param imgHeight - Высота изображения.
   * @param positionComponent - Компонент позиции формы.
   * @param rotateComponent - Компонент вращения формы.
   * @param isMirror - Компонент зеркального отображения формы.
   */
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

  /**
   * Применяет зеркальный эффект к контексту канваса.
   * @param ctx - Контекст оффскрин канваса.
   * @param angle - Угол вращения формы.
   */
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

  /**
   * Рисует изображение на канвасе с учетом угла вращения.
   * @param ctx - Контекст оффскрин канваса.
   * @param img - Изображение для рендеринга.
   * @param imgWidth - Ширина изображения.
   * @param imgHeight - Высота изображения.
   * @param angle - Угол вращения.
   */
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

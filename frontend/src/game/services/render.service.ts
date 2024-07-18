import { inject, Injectable } from "@angular/core";
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

  render(params: CanvasParams, shapes: Entity[]): void {
    const { ctx, canvas, width, height } = params;

    if (!ctx || !shapes.length) {
      this.clearCanvasIfNoShapes(ctx, canvas);
      return;
    }

    requestAnimationFrame(() => {
      shapes.forEach((shape) => {
        const {
          rotateComponent,
          positionComponent,
          isMirror,
          shapeView,
          shapeMatrix,
          shapeRatio,
        } = this.getShapeComponents(shape);

        if (positionComponent && rotateComponent) {
          const imgWidth =
            (shapeMatrix.matrix.length / shapeMatrix.rows) *
            CELL_SIZE *
            shapeRatio.ratio;
          const imgHeight = shapeMatrix.rows * CELL_SIZE * shapeRatio.ratio;
          const asset = this.assetStore.entityMap()[shapeView.img];

          this.updateCanvasSize(canvas, rotateComponent.angle, width, height);
          this.renderShape(
            ctx,
            canvas,
            asset.img,
            imgWidth,
            imgHeight,
            positionComponent,
            rotateComponent,
            isMirror
          );
        }
      });
    });
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

  private updateCanvasSize(
    canvas: HTMLCanvasElement,
    angle: number,
    width: number,
    height: number
  ): void {
    if (angle === 90 || angle === 270) {
      if (canvas.width !== height * 2 || canvas.height !== width) {
        canvas.width = height * 2;
        canvas.height = width;
      }
    } else {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

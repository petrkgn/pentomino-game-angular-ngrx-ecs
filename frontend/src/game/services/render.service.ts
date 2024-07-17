import { inject, Injectable } from "@angular/core";
import { WINDOW } from "@ng-web-apis/common";

import { RenderParams } from "../types/render-params";
import { PickComponentType } from "../types/components";
import { ComponentType } from "../constants/component-type.enum";
import { AssetService } from "./asset.service";

@Injectable({
  providedIn: "root",
})
export class RenderService {
  private readonly window = inject(WINDOW);
  private readonly assetService = inject(AssetService)

  render(params: RenderParams): void {
    const { ctx, canvas, shapes, img, imgWidth, imgHeight } = params;

    if (!ctx || !shapes.length) {
      this.clearCanvasIfNoShapes(ctx, canvas);
      return;
    }

    shapes.every((shape) => {
      const { rotateComponent, positionComponent, isMirror } =
        this.getShapeComponents(shape);

      if (positionComponent && rotateComponent) {
        this.updateCanvasSize(canvas, rotateComponent.angle);
        this.renderShape(
          ctx,
          canvas,
          img,
          imgWidth,
          imgHeight,
          positionComponent,
          rotateComponent,
          isMirror
        );
      }
    });
  }

  private getShapeComponents(shape: any) {
    const rotateComponent = shape.components.entities[
      ComponentType.ROTATE
    ] as PickComponentType<ComponentType.ROTATE>;

    const positionComponent = shape.components.entities[
      ComponentType.POSITION
    ] as PickComponentType<ComponentType.POSITION>;

    const isMirror = shape.components.entities[
      ComponentType.IS_MIRROR_TAG
    ] as PickComponentType<ComponentType.IS_MIRROR_TAG>;

    return { rotateComponent, positionComponent, isMirror };
  }

  private clearCanvasIfNoShapes(
    ctx: CanvasRenderingContext2D | null,
    canvas: HTMLCanvasElement
  ): void {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  private updateCanvasSize(canvas: HTMLCanvasElement, angle: number): void {
    if (angle === 90 || angle === 270) {
      canvas.width = this.window.innerHeight * 2;
      canvas.height = this.window.innerWidth;
    } else {
      canvas.width = this.window.innerWidth;
      canvas.height = this.window.innerHeight;
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

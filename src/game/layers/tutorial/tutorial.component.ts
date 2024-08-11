import {
  Component,
  ElementRef,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from "@angular/core";

import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { CanvasParams } from "../../types/canvas-params";
import { GameStateService } from "../../services/game-state.service";

@Component({
  selector: "game-tutorial",
  imports: [CanvasParamsDirective],
  standalone: true,
  template: `
    <canvas
      canvasParams
      [context]="'2d'"
      (canvasParams)="canvasParams.set($event)"
      #canvas
    ></canvas>

    <img #gameDescription src="/assets/game_description.png" />
    <img #gameControl src="/assets/game_control.png" />
  `,
  styles: [
    `
      img {
        display: none;
      }
    `,
  ],
})
export class TutorialComponent {
  private readonly gameDescription =
    viewChild.required<ElementRef<HTMLImageElement>>("gameDescription");
  private readonly gameControl =
    viewChild.required<ElementRef<HTMLImageElement>>("gameControl");

  private readonly gameStateService = inject(GameStateService);

  canvasParams = signal<CanvasParams | null>(null);

  constructor() {
    effect(() => {
      const params = this.canvasParams();
      const gameDescriptionImg = this.gameDescription();
      const gameControlImg = this.gameControl();

      if (params && gameDescriptionImg && gameControlImg) {
        untracked(() => {
          this.handleImagesLoading(
            gameDescriptionImg.nativeElement,
            gameControlImg.nativeElement
          );
        });
      }
    });
  }

  private handleImagesLoading(
    descriptionEl: HTMLImageElement,
    controlEl: HTMLImageElement
  ): void {
    const onImagesLoaded = () => {
      this.renderTutorial(this.canvasParams(), descriptionEl, controlEl);
    };

    if (descriptionEl.complete && controlEl.complete) {
      onImagesLoaded();
    } else {
      descriptionEl.onload = onImagesLoaded;
      controlEl.onload = onImagesLoaded;
    }
  }

  private renderTutorial(
    canvasParams: CanvasParams | null,
    descriptionEl: HTMLImageElement,
    controlEl: HTMLImageElement
  ): void {
    if (
      !canvasParams ||
      !(canvasParams.ctx instanceof CanvasRenderingContext2D)
    )
      return;

    this.showDescriptionImage(canvasParams, descriptionEl, controlEl);
  }

  private getButtonDimensions(
    centerX: number,
    centerY: number,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number
  ) {
    return {
      x: centerX + offsetX,
      y: centerY + offsetY,
      width,
      height,
    };
  }

  private drawOverlay(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    color: string = "rgba(0, 0, 0, 0.2)"
  ) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private clearCanvas(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  private drawImageCentered(
    ctx: CanvasRenderingContext2D,
    canvasCenter: { x: number; y: number },
    imgEl: HTMLImageElement
  ) {
    const imgWidth = imgEl.width;
    const imgHeight = imgEl.height;

    const topLeftX = canvasCenter.x - imgWidth / 2;
    const topLeftY = canvasCenter.y - imgHeight / 2;

    this.drawOverlay(ctx, ctx.canvas);
    ctx.drawImage(imgEl, topLeftX, topLeftY);
  }

  private handleClick(
    event: MouseEvent,
    button: { x: number; y: number; width: number; height: number },
    callback: () => void
  ) {
    const ratio = window.devicePixelRatio || 1;
    const clickX = event.offsetX * ratio;
    const clickY = event.offsetY * ratio;

    if (
      clickX >= button.x &&
      clickX <= button.x + button.width &&
      clickY >= button.y &&
      clickY <= button.y + button.height
    ) {
      callback();
    }
  }

  private addButtonClickListener(
    canvas: HTMLCanvasElement,
    button: { x: number; y: number; width: number; height: number },
    callback: () => void
  ) {
    const onClick = (event: MouseEvent) => {
      this.handleClick(event, button, () => {
        canvas.removeEventListener("click", onClick);
        callback();
      });
    };

    canvas.addEventListener("click", onClick);
  }

  private showControlImage(
    canvasParams: CanvasParams,
    controlEl: HTMLImageElement
  ) {
    const { ctx, canvasCenter, canvas } = canvasParams;
    if (!(ctx instanceof CanvasRenderingContext2D)) return;
    this.clearCanvas(ctx, canvas);
    this.drawImageCentered(ctx, canvasCenter!, controlEl);

    const button = this.getButtonDimensions(
      canvasCenter!.x,
      canvasCenter!.y,
      -45,
      130,
      100,
      30
    );
    this.addButtonClickListener(canvas, button, () =>
      this.gameStateService.startPlaying()
    );
  }

  private showDescriptionImage(
    canvasParams: CanvasParams,
    descriptionEl: HTMLImageElement,
    controlEl: HTMLImageElement
  ) {
    const { ctx, canvasCenter, canvas } = canvasParams;
    if (!(ctx instanceof CanvasRenderingContext2D)) return;
    this.drawImageCentered(ctx, canvasCenter!, descriptionEl);

    const button = this.getButtonDimensions(
      canvasCenter!.x,
      canvasCenter!.y,
      -50,
      208,
      100,
      30
    );
    this.addButtonClickListener(canvas, button, () =>
      this.showControlImage(canvasParams, controlEl)
    );
  }
}

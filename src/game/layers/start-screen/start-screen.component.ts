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
import { RectService } from "../../services/rect.service";
import { GameStateService } from "../../services/game-state.service";

@Component({
  selector: "game-start-screen",
  imports: [CanvasParamsDirective],
  standalone: true,
  template: `
    <canvas
      canvasParams
      [context]="'2d'"
      (canvasParams)="canvasParamsBg.set($event)"
      #canvasBg
    ></canvas>

    <canvas
      canvasParams
      [context]="'2d'"
      (canvasParams)="canvasParamsBar.set($event)"
      #canvasBar
    ></canvas>

    <img #bgImg src="/assets/start_screen.webp" />
    <img #startButton src="/assets/start_game.png" />
  `,
  styles: [
    `
      img {
        display: none;
      }
    `,
  ],
})
export class StartScreenComponent {
  private readonly bgImg =
    viewChild.required<ElementRef<HTMLImageElement>>("bgImg");
  private readonly startButton =
    viewChild.required<ElementRef<HTMLImageElement>>("startButton");

  private readonly rectService = inject(RectService);
  private readonly gameStateService = inject(GameStateService);

  canvasParamsBg = signal<CanvasParams | null>(null);
  canvasParamsBar = signal<CanvasParams | null>(null);

  constructor() {
    effect(() => {
      const paramsBg = this.canvasParamsBg();
      const paramsBar = this.canvasParamsBar();
      const bgImg = this.bgImg();
      const startButtonImg = this.startButton();

      if (paramsBg && bgImg && startButtonImg) {
        untracked(() => {
          this.loadImages(
            bgImg.nativeElement,
            startButtonImg.nativeElement
          ).then(() => {
            this.renderBackground(paramsBg, bgImg.nativeElement);
            this.renderLoadingBar(paramsBar);
          });
        });
      }
    });
  }

  private loadImages(...images: HTMLImageElement[]): Promise<void> {
    return new Promise<void>((resolve) => {
      let loadedCount = 0;
      images.forEach((img) => {
        if (img.complete) {
          loadedCount++;
        } else {
          img.onload = () => {
            loadedCount++;
            if (loadedCount === images.length) {
              resolve();
            }
          };
        }
      });
      if (loadedCount === images.length) {
        resolve();
      }
    });
  }

  private renderBackground(
    canvasParams: CanvasParams | null,
    imgEl: HTMLImageElement
  ): void {
    if (!this.isValidCanvasParams(canvasParams)) return;

    const { ctx, canvasCenter, canvas } = canvasParams!;

    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    const { topLeftX, topLeftY } = this.rectService.getTopLeftCoordinates(
      1280,
      896,
      canvasCenter!.x,
      canvasCenter!.y
    );

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgEl, topLeftX, topLeftY, 1280, 896);
  }

  private renderLoadingBar(canvasParams: CanvasParams | null): void {
    if (!this.isValidCanvasParams(canvasParams)) return;

    document.fonts.ready.then(() => {
      this.animateLoadingBar(canvasParams!);
    });
  }

  private animateLoadingBar(canvasParams: CanvasParams): void {
    const { ctx, canvasCenter } = canvasParams;
    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    const barDimensions = this.getLoadingBarDimensions(canvasCenter!);

    const startTime = Date.now();
    const minLoadingTime = 3000;

    const updateProgress = () => {
      const progress = this.calculateProgress(
        Date.now() - startTime,
        minLoadingTime
      );

      this.clearLoadingBar(ctx, barDimensions);
      this.drawLoadingBar(ctx, barDimensions, progress);
      this.drawLoadingText(ctx, canvasCenter!.x, barDimensions.barY);

      if (progress >= 100) {
        this.renderStartButton(canvasParams);
      } else {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  }

  private renderStartButton(canvasParams: CanvasParams): void {
    if (!this.isValidCanvasParams(canvasParams)) return;

    const { ctx, canvasCenter } = canvasParams;

    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    const buttonImg = this.startButton().nativeElement;

    this.clearCanvas(ctx);

    const buttonDimensions = this.getStartButtonDimensions(
      canvasCenter!,
      buttonImg
    );
    ctx.drawImage(
      buttonImg,
      buttonDimensions.buttonX,
      buttonDimensions.buttonY,
      buttonDimensions.buttonWidth,
      buttonDimensions.buttonHeight
    );

    this.setupStartButtonClickListener(canvasParams.canvas, buttonDimensions);
  }

  private isValidCanvasParams(canvasParams: CanvasParams | null): boolean {
    return (
      Boolean(canvasParams) &&
      canvasParams?.ctx instanceof CanvasRenderingContext2D
    );
  }

  private getLoadingBarDimensions(canvasCenter: { x: number; y: number }) {
    const barWidth = 470;
    const barHeight = 5;
    const barX = canvasCenter.x - barWidth / 2;
    const barY = canvasCenter.y + 370;

    return { barWidth, barHeight, barX, barY };
  }

  private calculateProgress(elapsedTime: number, minLoadingTime: number) {
    return Math.min((elapsedTime / minLoadingTime) * 100, 100);
  }

  private clearLoadingBar(
    ctx: CanvasRenderingContext2D,
    {
      barX,
      barY,
      barWidth,
      barHeight,
    }: { barX: number; barY: number; barWidth: number; barHeight: number }
  ) {
    ctx.clearRect(barX - 10, barY - 10, barWidth + 20, barHeight + 50);
  }

  private drawLoadingBar(
    ctx: CanvasRenderingContext2D,
    {
      barX,
      barY,
      barWidth,
      barHeight,
    }: { barX: number; barY: number; barWidth: number; barHeight: number },
    progress: number
  ) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "#00FF00";
    ctx.fillRect(barX, barY, (progress / 100) * barWidth, barHeight);
  }

  private drawLoadingText(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    barY: number
  ) {
    ctx.save();
    ctx.fillStyle = Date.now() % 1000 < 500 ? "#FFFFFF" : "#FF0000";
    ctx.font = "24px 'DesdaC'";
    ctx.textAlign = "center";
    ctx.fillText("Loading...", centerX, barY + 30);
    ctx.restore();
  }

  private clearCanvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  private getStartButtonDimensions(
    canvasCenter: { x: number; y: number },
    buttonImg: HTMLImageElement
  ) {
    const buttonWidth = buttonImg.width * 2;
    const buttonHeight = buttonImg.height * 2;
    const buttonX = canvasCenter.x - buttonImg.width;
    const buttonY = canvasCenter.y + 360;

    return { buttonWidth, buttonHeight, buttonX, buttonY };
  }

  private setupStartButtonClickListener(
    canvas: HTMLCanvasElement,
    {
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
    }: {
      buttonX: number;
      buttonY: number;
      buttonWidth: number;
      buttonHeight: number;
    }
  ) {
    canvas.addEventListener("click", (event: MouseEvent) => {
      const clickX = event.offsetX;
      const clickY = event.offsetY;

      if (
        this.isClickInsideButton(
          clickX,
          clickY,
          buttonX,
          buttonY,
          buttonWidth,
          buttonHeight
        )
      ) {
        this.gameStateService.startTutorial();
      }
    });
  }

  private isClickInsideButton(
    clickX: number,
    clickY: number,
    buttonX: number,
    buttonY: number,
    buttonWidth: number,
    buttonHeight: number
  ) {
    return (
      clickX >= buttonX &&
      clickX <= buttonX + buttonWidth &&
      clickY >= buttonY &&
      clickY <= buttonY + buttonHeight
    );
  }
}

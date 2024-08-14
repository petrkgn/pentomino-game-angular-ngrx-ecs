import {
  Component,
  ElementRef,
  OnInit,
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
  selector: "game-level-completed",
  imports: [CanvasParamsDirective],
  standalone: true,
  template: `
    <canvas
      canvasParams
      [context]="'2d'"
      (canvasParams)="canvasParams.set($event)"
      #canvas
    ></canvas>

    <img #levelCompleted src="/assets/level_completed.png" />
  `,
  styles: [
    `
      img {
        display: none;
      }
    `,
  ],
})
export class LevelCompletedComponent implements OnInit {
  private readonly gameStateService = inject(GameStateService);
  private readonly levelCompleted =
    viewChild.required<ElementRef<HTMLImageElement>>("levelCompleted");

  private levelCompletedSound = new Audio("assets/level_yes.mp3");

  canvasParams = signal<CanvasParams | null>(null);

  constructor() {
    effect(() => {
      const params = this.canvasParams();
      const levelCompleted = this.levelCompleted();

      if (params && levelCompleted) {
        untracked(() => {
          this.handleImagesLoading(levelCompleted.nativeElement);
        });
      }
    });
  }
  ngOnInit(): void {
    this.levelCompletedSound.play();
  }

  private handleImagesLoading(levelCompletedEl: HTMLImageElement): void {
    const onImagesLoaded = () => {
      this.renderMessage(this.canvasParams(), levelCompletedEl);
    };

    if (levelCompletedEl.complete) {
      onImagesLoaded();
    } else {
      levelCompletedEl.onload = onImagesLoaded;
    }
  }

  private renderMessage(
    canvasParams: CanvasParams | null,
    levelCompletedEl: HTMLImageElement
  ): void {
    if (
      !canvasParams ||
      !(canvasParams.ctx instanceof CanvasRenderingContext2D)
    )
      return;

    this.showMessageImage(canvasParams, levelCompletedEl);
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
    color: string = "rgba(0, 0, 0, 0.4)"
  ) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    ctx.fillRect(canvasCenter!.x - 45, canvasCenter!.y + 48, 100, 30);
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

  private showMessageImage(
    canvasParams: CanvasParams,
    levelCompletedEl: HTMLImageElement
  ) {
    const { ctx, canvasCenter, canvas } = canvasParams;
    if (!(ctx instanceof CanvasRenderingContext2D)) return;
    this.drawImageCentered(ctx, canvasCenter!, levelCompletedEl);

    const button = this.getButtonDimensions(
      canvasCenter!.x,
      canvasCenter!.y,
      -45,
      48,
      100,
      30
    );
    this.addButtonClickListener(canvas, button, () => {
      this.gameStateService.startPlaying();
    });
  }
}

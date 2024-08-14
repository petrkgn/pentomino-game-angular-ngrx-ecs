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
import { RectService } from "../../services/rect.service";

@Component({
  selector: "game-curtain",
  imports: [CanvasParamsDirective],
  standalone: true,
  template: `
    <canvas
      canvasParams
      [context]="'2d'"
      (canvasParams)="canvasParams.set($event)"
      #canvas
    ></canvas>
    <img #fon src="/assets/fon.png" />
  `,
  styles: [
    `
      img {
        display: none;
      }
    `,
  ],
})
export class CurtainComponent {
  private readonly fon =
    viewChild.required<ElementRef<HTMLImageElement>>("fon");

  private readonly gameStateService = inject(GameStateService);
  private readonly rectService = inject(RectService);

  canvasParams = signal<CanvasParams | null>(null);

  constructor() {
    effect(() => {
      const params = this.canvasParams();
      const fonImg = this.fon();

      if (params && fonImg) {
        untracked(() => {
          this.handleImagesLoading(fonImg.nativeElement);
        });
      }
    });
  }

  private handleImagesLoading(fonEl: HTMLImageElement): void {
    const onImagesLoaded = () => {
      this.renderFon(this.canvasParams(), fonEl);
    };

    if (fonEl.complete) {
      onImagesLoaded();
    } else {
      fonEl.onload = onImagesLoaded;
    }
  }

  private renderFon(
    canvasParams: CanvasParams | null,
    imgEl: HTMLImageElement
  ): void {
    if (!canvasParams) return;

    const { ctx, canvasCenter } = canvasParams;
    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    const { topLeftX, topLeftY } = this.rectService.getTopLeftCoordinates(
      1280,
      896,
      canvasCenter!.x,
      canvasCenter!.y
    );

    ctx.drawImage(imgEl, topLeftX, topLeftY, 1280, 896);
  }
}

import {
  Component,
  inject,
  effect,
  untracked,
  signal,
  AfterViewInit,
  viewChild,
  ElementRef,
} from "@angular/core";

import { Entity } from "../../types/entity";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { RenderService } from "../../services/render-shapes.service";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { CanvasParams } from "../../types/canvas-params";
import { CanvasContext } from "../../constants/canvas-context";

@Component({
  selector: "game-active-shape",
  standalone: true,
  imports: [CanvasParamsDirective],
  providers: [RenderService],
  template: `
    <canvas
      canvasParams
      [canvasCss]="'background-color: red; opacity: 0.2;'"
      [context]="canvasContext"
      (canvasParams)="canvasParams.set($event)"
      #canvas
    ></canvas>
  `,
})
export class ActiveShapeComponent {
  private readonly gameFacade = inject(GameFacade);
  private readonly renderService = inject(RenderService);

  activeShapes = toSignal(this.gameFacade.selectActiveShape(), {
    initialValue: [],
  });

  canvasContext = "bitmaprenderer" as const;
  canvasParams = signal<CanvasParams | null>(null);

  constructor() {
    effect((): void => {
      const activeShapes = this.activeShapes();
      const canvasParams = this.canvasParams();
      untracked(() => {
        if (!canvasParams) return;
        this.renderShapes(canvasParams, activeShapes);
      });
    });
  }

  renderShapes(canvasParams: CanvasParams, activeShapes: Entity[]): void {
    this.renderService.renderCurrentShapes(canvasParams, activeShapes);
  }
}

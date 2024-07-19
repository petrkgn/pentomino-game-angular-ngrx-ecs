import { Component, inject, effect, untracked, signal } from "@angular/core";

import { Entity } from "../../types/entity";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { RenderService } from "../../services/render.service";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { CanvasParams } from "../../types/canvas-params";

@Component({
  selector: "game-active-shape",
  standalone: true,
  imports: [CanvasParamsDirective],
  template: `
    <canvas
      canvasParams
      [canvasCss]="''"
      (canvasParams)="onCanvasParams($event)"
      #canvas
    ></canvas>
  `,
  styles: ``,
})
export class ActiveShapeComponent {
  private readonly gameFacade = inject(GameFacade);
  private readonly renderService = inject(RenderService);

  activeShapes = toSignal(this.gameFacade.selectActiveShape(), {
    initialValue: [],
  });

  private canvasParams = signal<CanvasParams | null>(null);

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

  onCanvasParams(params: CanvasParams): void {
    this.canvasParams.set(params);
  }

  renderShapes(canvasParams: CanvasParams, activeShapes: Entity[]): void {
    this.renderService.renderCurrentShapes(canvasParams, activeShapes);
  }
}

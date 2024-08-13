import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from "@angular/core";

import { Entity } from "../../types/entity";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { CanvasParams } from "../../types/canvas-params";
import { ShapesPackRenderService } from "../../services/render-sapes-pack.service";

@Component({
  selector: "game-shapes-pack",
  standalone: true,
  imports: [CanvasParamsDirective],
  template: `
    <canvas
      canvasParams
      [canvasCss]="''"
      (canvasParams)="canvasParams.set($event)"
      #canvas
    ></canvas>
  `,
  styles: ``,
})
export class ShapesPackComponent {
  private readonly gameFacade = inject(GameFacade);
  private readonly shapesPackRenderService = inject(ShapesPackRenderService);

  shapesPack = toSignal(this.gameFacade.selectShapesPack(), {
    initialValue: [],
  });

  canvasParams = signal<CanvasParams | null>(null);

  constructor() {
    effect((): void => {
      const activeShapes = this.shapesPack();
      const canvasParams = this.canvasParams();

      untracked(() => {
        if (!canvasParams || !activeShapes) return;
        this.renderShapes(canvasParams, activeShapes);
      });
    });
  }

  renderShapes(canvasParams: CanvasParams, activeShapes: Entity[]): void {
    this.shapesPackRenderService.renderShapesPack(canvasParams, activeShapes);
  }
}

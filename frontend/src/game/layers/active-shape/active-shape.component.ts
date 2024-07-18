import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  ViewChild,
  effect,
} from "@angular/core";
import { WINDOW } from "@ng-web-apis/common";
import { Entity } from "../../types/entity";
import { EntityView } from "../../constants/view.enum";
import { ResizeService } from "../../services/resize.service";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { AssetStore } from "../../store/assets/asset-srore";
import { tap } from "rxjs/internal/operators/tap";
import { RenderService } from "../../services/render.service";
import { RenderParams } from "../../types/render-params";
import { isDefined } from "../../utils";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { CanvasParams } from "../../types/canvas-params";
import { animationFrameScheduler } from "rxjs";

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

  readonly componentView = EntityView;

  activeShapes = toSignal(this.gameFacade.selectActiveShape(), {
    initialValue: [],
  });

  private canvasParams!: CanvasParams;

  constructor() {
    effect((): void => {
      animationFrameScheduler.schedule(
        function (actions) {
          this.schedule(actions);
        },
        0,
        this.renderShapes()
      );
    });
  }

  onCanvasParams(params: CanvasParams): void {
    this.canvasParams = params;
  }

  renderShapes(): void {
    this.renderService.render(
      this.canvasParams,
      this.activeShapes() as Entity[]
    );
  }
}

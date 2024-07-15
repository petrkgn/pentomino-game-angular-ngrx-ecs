import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  ViewChild,
} from "@angular/core";

import { AsyncPipe, JsonPipe, NgIf } from "@angular/common";

import { Entity } from "../../types/entity";
import { ComponentType } from "../../constants/component-type.enum";
import { PickComponentType } from "../../types/components";
import { ResizeService } from "../../services/resize.service";
import { animationFrameScheduler, switchMap, tap } from "rxjs";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { CanvasParams } from "../../types/canvas-params";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { RenderService } from "../../services/render.service";
import { RenderParams } from "../../types/render-params";

@Component({
  selector: "game-placement-shapes",
  imports: [CanvasParamsDirective, JsonPipe, NgIf, AsyncPipe],
  standalone: true,
  template: `
    <canvas
      canvasParams
      [canvasCss]="''"
      (canvasParams)="onCanvasParams($event)"
      #canvas
    ></canvas>
    <div>
      <img
        #myImg
        src="https://github.com/petrkgn/katamino-game-angular/blob/main/wshape.png?raw=true"
      />
    </div>
  `,
  styles: `
    img {
      position: absolute;
      display: none;
    }  
`,
})
export class PlacementShapesComponent implements AfterViewInit {
  private readonly resizeService = inject(ResizeService);
  private readonly gameFacade = inject(GameFacade);
  private readonly renderService = inject(RenderService);

  @ViewChild("myImg", { static: true })
  private readonly img!: ElementRef;

  private imgWidth = 96;
  private imgHeight = 96;

  placementShapes = toSignal(this.gameFacade.selectPlacementShapes(), {
    initialValue: [],
  });

  ratio = 0;

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

  ngAfterViewInit() {
    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(
        tap((value) => {
          this.ratio = Math.ceil(value);
          this.imgWidth = 96 * this.ratio;
          this.imgHeight = 96 * this.ratio;
        })
      )
      .subscribe();
  }

  onCanvasParams(params: CanvasParams): void {
    this.canvasParams = params;
  }

  renderShapes(): void {
    if (!this.canvasParams.ctx) return;
    const params: RenderParams = {
      ctx: this.canvasParams.ctx,
      canvas: this.canvasParams?.canvasEl || null,
      shapes: this.placementShapes() as Entity[],
      img: this.img.nativeElement,
      imgWidth: this.imgWidth,
      imgHeight: this.imgHeight,
    };
    this.renderService.render(params);
  }
}

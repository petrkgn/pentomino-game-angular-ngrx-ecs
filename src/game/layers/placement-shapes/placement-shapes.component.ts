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

import { WINDOW } from "@ng-web-apis/common";
import { Entity } from "../../interfaces/entity";
import { ComponentType } from "../../constants/component-type.enum";
import { PickComponentType } from "../../interfaces/components";
import { isDefined } from "../../utils/filter-defined";
import { ResizeService } from "../../services/resize.service";
import { animationFrameScheduler, switchMap, tap } from "rxjs";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { CanvasParams } from "../../interfaces/canvas-params";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";

@Component({
  selector: "game-placement-shapes",
  imports: [CanvasParamsDirective, JsonPipe, NgIf, AsyncPipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- <div
      style="position:absolute; background-color: darkblue; opacity: 0.8; color: white; width: 200px; top: 300px"
    > -->
    <!-- <pre>{{activeShapes() | json}}</pre> -->
    <!-- </div> -->
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
    effect((): any => {
      animationFrameScheduler.schedule(
        function (actions) {
          this.schedule(actions);
        },
        0,
        this.render(this.placementShapes())
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

  render(placementShapes: Entity[]): void {
    const ctx = this.canvasParams.ctx;
    if (!placementShapes?.length && ctx) {
      ctx.clearRect(
        0,
        0,
        this.canvasParams.canvasEl.width,
        this.canvasParams.canvasEl.height
      );
      return;
    }

    placementShapes.forEach((shape) => {
      if (!ctx || !this.img) return;

      const rotateComponent = shape.components.find(
        (component): component is PickComponentType<ComponentType.ROTATE> =>
          component.type === ComponentType.ROTATE
      );

      const positionComponent = shape.components.find(
        (component): component is PickComponentType<ComponentType.POSITION> =>
          component.type === ComponentType.POSITION
      );

      if (positionComponent && rotateComponent) {
        const angle = rotateComponent.angle;
        const x = positionComponent.x;
        const y = positionComponent.y;
        const shape = this.img.nativeElement;

        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.rotate((Math.PI / 180) * angle);
        ctx.translate(-x, -y);
        ctx.drawImage(
          shape,
          x - this.imgWidth / 2,
          y - this.imgHeight / 2,
          this.imgWidth,
          this.imgHeight
        );
        ctx.fill();
        ctx.restore();
      }
    });
  }
}

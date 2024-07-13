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
      this.clearCanvas();
      return;
    }

    placementShapes.forEach((shape) => {
      if (!ctx || !this.img) return;

      const rotateComponent = shape.components.entities[
        ComponentType.ROTATE
      ] as PickComponentType<ComponentType.ROTATE>;

      const positionComponent = shape.components.entities[
        ComponentType.POSITION
      ] as PickComponentType<ComponentType.POSITION>;

      if (positionComponent && rotateComponent) {
        const angle = rotateComponent.angle;
        const x = positionComponent.x;
        const y = positionComponent.y;
        const shape = this.img.nativeElement;

        this.clearCanvas();
        ctx.save();
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

        ctx.restore();
      }
    });
  }

  private clearCanvas(): void {
    if (this.canvasParams.ctx) {
      this.canvasParams.ctx.clearRect(
        0,
        0,
        this.canvasParams.canvasEl.width,
        this.canvasParams.canvasEl.height
      );
    }
  }
}

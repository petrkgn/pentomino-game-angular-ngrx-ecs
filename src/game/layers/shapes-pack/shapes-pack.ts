import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  ViewChild,
} from "@angular/core";

import { WINDOW } from "@ng-web-apis/common";
import { Entity } from "../../types/entity";
import { ComponentType } from "../../constants/component-type.enum";
import { PickComponentType } from "../../types/components";
import { isDefined } from "../../utils/filter-defined";
import { ResizeService } from "../../services/resize.service";
import { tap } from "rxjs";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { EntityView } from "../../constants/view.enum";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { CanvasParams } from "../../types/canvas-params";

@Component({
  selector: "game-shapes-pack",
  standalone: true,
  imports: [CanvasParamsDirective],
  template: `
    <canvas
      canvasParams
      [canvasCss]="''"
      (canvasParams)="onCanvasParams($event)"
      #canvas
    ></canvas>
    <img #myImg class="assets" src="/assets/wshape.png" />
  `,
  styles: ``,
})
export class ShapesPackComponent implements AfterViewInit {
  private readonly resizeService = inject(ResizeService);
  private readonly window = inject(WINDOW);
  private readonly gameFacade = inject(GameFacade);

  readonly componentView = EntityView;

  private imgWidth = 96;
  private imgHeight = 96;

  @ViewChild("myImg", { static: true })
  private readonly img!: ElementRef;
  private canvasParams!: CanvasParams;
  shapesPack = toSignal(this.gameFacade.selectShapesPack(), {
    initialValue: [],
  });

  constructor() {
    effect((): any => {
      if (isDefined(this.shapesPack()))
        this.render(this.shapesPack() as Entity[]);
    });
  }

  ngAfterViewInit() {
    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(
        tap((value) => {
          const ratio = Math.ceil(value);

          this.imgWidth = 96 * ratio;
          this.imgHeight = 96 * ratio;
        })
      )
      .subscribe();
  }

  onCanvasParams(params: CanvasParams): void {
    this.canvasParams = params;
  }

  render(shapesPack: Entity[]): void {
    if (!shapesPack.length && this.canvasParams.ctx) {
      this.canvasParams.ctx.clearRect(
        0,
        0,
        this.window.innerWidth,
        this.window.innerHeight
      );
      return;
    }

    shapesPack.forEach((shape) => {
      if (!this.canvasParams.ctx || !this.img) {
        this.clearCanvas();
        return;
      }

      const hintBox = shape.components.entities[
        ComponentType.HINT_BOX
      ] as PickComponentType<ComponentType.HINT_BOX>;

      if (hintBox) {
        const shape = this.img.nativeElement;

        this.clearCanvas();
        this.canvasParams.ctx.save();
        this.canvasParams.ctx.drawImage(
          shape,
          hintBox.x + hintBox.width / 4,
          hintBox.y + hintBox.height / 4,
          hintBox.width / 2,
          hintBox.height / 2
        );
        this.canvasParams.ctx.fill();
        this.canvasParams.ctx.restore();
      }
    });
  }

  private clearCanvas(): void {
    if (this.canvasParams.ctx) {
      this.canvasParams.ctx.clearRect(
        0,
        0,
        this.canvasParams.canvas.width,
        this.canvasParams.canvas.height
      );
    }
  }
}

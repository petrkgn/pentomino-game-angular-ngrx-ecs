import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from "@angular/core";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { ResizeService } from "../../services/resize.service";
import { CanvasParams } from "../../interfaces/canvas-params";
import { ComponentView } from "../../constants/view.enum";
import { CELL_SIZE } from "../../constants/cell-size";
import { animationFrameScheduler, tap } from "rxjs";
import { BoardsSize } from "../../constants/board-size";

@Component({
  selector: "game-background",
  imports: [CanvasParamsDirective],
  standalone: true,
  template: ` <canvas
      canvasParams
      (canvasParams)="onCanvasParams($event)"
      #canvas
    ></canvas>
    <img #bgImg [src]="componentView.BG" />`,
  styles: `
  img {
   display: none;
  }  
`,
})
export class BackgroundComponent {
  private readonly resizeService = inject(ResizeService);

  readonly componentView = ComponentView;

  private canvasParams!: CanvasParams;

  cellSize = CELL_SIZE;
  numRows = 5;
  numCols = BoardsSize.firstLevel.length / this.numRows;
  boardPosition: { topLeftX: number; topLeftY: number } = {
    topLeftX: 0,
    topLeftY: 0,
  };

  @ViewChild("bgImg", { static: true })
  private readonly bgImg!: ElementRef;

  constructor() {}

  ngAfterViewInit() {
    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(
        tap((value) => {
          const ratio = Math.ceil(value);
          this.cellSize = CELL_SIZE * ratio;

          animationFrameScheduler.schedule(
            function (actions) {
              this.schedule(actions);
            },
            0,
            this.render(ratio)
          );
        })
      )
      .subscribe();
  }

  onCanvasParams(params: CanvasParams): void {
    this.canvasParams = params;
  }

  render(ratio: number): void {
    if (!this.canvasParams.ctx || !this.bgImg) return;
    const { topLeftX, topLeftY } = this.getTopLeftCoordinates(
      1280,
      900,
      this.canvasParams.canvasCenter.x,
      this.canvasParams.canvasCenter.y
    );
    this.canvasParams.ctx.lineWidth = 2 * ratio;
    this.canvasParams.ctx.drawImage(
      this.bgImg.nativeElement,
      topLeftX,
      topLeftY,
      1280,
      900
    );
  }

  private getTopLeftCoordinates(
    width: number,
    height: number,
    centerX: number,
    centerY: number
  ): {
    topLeftX: number;
    topLeftY: number;
  } {
    const topLeftX = centerX - width / 2;
    const topLeftY = centerY - height / 2;
    return { topLeftX, topLeftY };
  }
}

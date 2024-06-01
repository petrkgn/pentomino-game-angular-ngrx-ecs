import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
} from "@angular/core";
import { Store } from "@ngrx/store";
import { animationFrameScheduler, tap } from "rxjs";
import { BoardsSize } from "../../constants/board-size";
import { PentominoActions } from "../../store/game/actions";
import { GameObjectsIds } from "../../constants/game-objects-ids.enum";
import { ComponentType } from "../../constants/component-type.enum";
import { ResizeService } from "../../services/resize.service";
import { CanvasParams } from "../../interfaces/canvas-params";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { CELL_SIZE } from "../../constants/cell-size";

export type BoardPositionParams = {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};
@Component({
  selector: "game-board",
  imports: [CanvasParamsDirective],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <canvas
    canvasParams
    [canvasCss]="canvasCss"
    (canvasParams)="onCanvasParams($event)"
    #canvas
  ></canvas>`,
})
export class BoardComponent implements AfterViewInit {
  private readonly store = inject(Store);
  private readonly resizeService = inject(ResizeService);

  private canvasParams!: CanvasParams;

  cellSize = CELL_SIZE;
  numRows = 5;
  numCols = BoardsSize.firstLevel.length / this.numRows;
  canvasCss = "background-color: green; opacity: 0.5";
  boardPosition: { topLeftX: number; topLeftY: number } = {
    topLeftX: 0,
    topLeftY: 0,
  };

  constructor() {}

  ngAfterViewInit() {
    this.getBoardPosition();
    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(
        tap((value) => {
          const ratio = Math.ceil(value);
          this.cellSize = CELL_SIZE * ratio;
          this.getBoardPosition();

          animationFrameScheduler.schedule(
            function (actions) {
              this.schedule(actions);
            },
            0,
            this.drawGrid(ratio)
          );
        })
      )
      .subscribe();
  }

  onCanvasParams(params: CanvasParams): void {
    this.canvasParams = params;
  }

  private getBoardPosition(): void {
    this.boardPosition = this.getTopLeftCoordinates({
      width: this.numCols * this.cellSize,
      height: this.numRows * this.cellSize,
      centerX: this.canvasParams.canvasCenter.x,
      centerY: this.canvasParams.canvasCenter.y,
    });
    this.store.dispatch(
      PentominoActions.updateComponentData({
        entityId: GameObjectsIds.BOARD,
        currentComponent: ComponentType.POSITION,
        changes: {
          x: this.boardPosition.topLeftX,
          y: this.boardPosition.topLeftY,
        },
      })
    );
  }

  private drawGrid(ratio: number): void {
    if (!this.canvasParams.ctx) return;

    this.canvasParams.ctx.lineWidth = 2 * ratio;

    for (let i = 0; i <= this.numRows; i++) {
      const y = i * this.cellSize;
      this.canvasParams.ctx.beginPath();
      this.canvasParams.ctx.moveTo(
        this.boardPosition.topLeftX,
        this.boardPosition.topLeftY + y
      );
      this.canvasParams.ctx.lineTo(
        this.boardPosition.topLeftX + this.numCols * this.cellSize,
        this.boardPosition.topLeftY + y
      );
      this.canvasParams.ctx.stroke();
    }

    // Вертикальные линии
    for (let i = 0; i <= this.numCols; i++) {
      const x = i * this.cellSize;
      this.canvasParams.ctx.beginPath();
      this.canvasParams.ctx.moveTo(
        this.boardPosition.topLeftX + x,
        this.boardPosition.topLeftY
      );
      this.canvasParams.ctx.lineTo(
        this.boardPosition.topLeftX + x,
        this.boardPosition.topLeftY + this.numRows * this.cellSize
      );
      this.canvasParams.ctx.stroke();
    }
  }

  private getTopLeftCoordinates(params: BoardPositionParams): {
    topLeftX: number;
    topLeftY: number;
  } {
    const topLeftX = params.centerX - params.width / 2;
    const topLeftY = params.centerY - params.height / 2;
    return { topLeftX, topLeftY };
  }
}

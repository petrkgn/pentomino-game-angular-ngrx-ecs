import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { BonudsElementDirective } from '../../directives/bounds-element.directive';
import { BoardsSize } from '../../constants/board-size';
import { PentominoActions } from '../../store/game/game.actions';
import { GameObjectsIds } from '../../constants/game-objects-ids.enum';
import { ComponentType } from '../../constants/component-type.enum';
import { ResizeService } from '../../services/resize.service';
import { CanvasParams } from '../../interfaces/canvas-params';
import { CanvasParamsDirective } from '../../directives/canvas-params.directive';


@Component({
  selector: 'game-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  imports: [
    BonudsElementDirective,
    CanvasParamsDirective
   ],
  standalone: true,
})
export class BoardComponent implements AfterViewInit {
  private readonly store = inject(Store);
  private readonly resizeService = inject(ResizeService);


  private canvasParams!: CanvasParams;

  cellSize = 32;
  numRows = BoardsSize.firstLevel.length;
  numCols = BoardsSize.firstLevel[0].length;
  boardTop = 0;
  boardLeft = 0;

  constructor() {}

  ngAfterViewInit() {
  
  
    this.canvasParams.layer.width = this.numCols * this.cellSize;
    this.canvasParams.layer.height = this.numRows * this.cellSize;
    // this.drawGrid();

    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(
        tap((value) => {
          const ratio = Math.ceil(value);
          this.cellSize = 32 * ratio;
          this.canvasParams.layer.width = this.numCols * this.cellSize;
          this.canvasParams.layer.height = this.numRows * this.cellSize;
          this.getBoardPosition();
          this.drawGrid(ratio);
        })
      )
      .subscribe();
  }

  onCanvasParams(params: CanvasParams): void {
    this.canvasParams = params;
  }

  private getBoardPosition(): void {
    this.boardTop = this.canvasParams.layer.getBoundingClientRect().top;
    this.boardLeft = this.canvasParams.layer.getBoundingClientRect().left;
    this.store.dispatch(
      PentominoActions.updateComponentData({
        entityId: GameObjectsIds.BOARD,
        currentComponent: ComponentType.POSITION,
        changes: { x: this.boardLeft, y: this.boardTop },
      })
    );
  }

  private drawGrid(ratio: number): void {
    if (!this.canvasParams.ctx) return;

    this.canvasParams.ctx.clearRect(0, 0, this.canvasParams.layer.width, this.canvasParams.layer.height);
    this.canvasParams.ctx.lineWidth = 0.6 * ratio;
    for (let i = 0; i <= this.numRows; i++) {
      const y = i * this.cellSize;
      this.canvasParams.ctx.beginPath();
      this.canvasParams.ctx.moveTo(0, y);
      this.canvasParams.ctx.lineTo(this.canvasParams.width, y);
      this.canvasParams.ctx.stroke();
    }

    // Вертикальные линии
    for (let i = 0; i <= this.numCols; i++) {
      const x = i * this.cellSize;
      this.canvasParams.ctx.beginPath();
      this.canvasParams.ctx.moveTo(x, 0);
      this.canvasParams.ctx.lineTo(x, this.canvasParams.height);
      this.canvasParams.ctx.stroke();
    }
  }
}

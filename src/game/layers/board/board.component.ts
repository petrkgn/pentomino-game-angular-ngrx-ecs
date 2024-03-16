import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { fromEvent, Observable, tap } from 'rxjs';
import { BonudsElementDirective } from '../../directives/bounds-element.directive';
import { BoardsSize } from '../../constants/board-size';
import { PentominoActions } from '../../store/game/game.actions';
import { GameObjectsIds } from '../../constants/game-objects-ids.enum';
import { ComponentType } from '../../constants/component-type.enum';
import { ResizeService } from '../../services/resize.service';


@Component({
  selector: 'game-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  imports: [BonudsElementDirective],
  standalone: true,
})
export class BoardComponent implements AfterViewInit {
  private readonly store = inject(Store);
  private readonly resizeService = inject(ResizeService);
  @ViewChild('canvas', { static: true })
  private canvas!: ElementRef<HTMLCanvasElement>;
  myCanvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;
  cellSize = 32;
  numRows = BoardsSize.firstLevel.length;
  numCols = BoardsSize.firstLevel[0].length;
  boardTop = 0;
  boardLeft = 0;

  constructor() {}

  ngAfterViewInit() {
    this.myCanvas = this.canvas.nativeElement;
    this.ctx = this.myCanvas.getContext('2d');
    this.myCanvas.width = this.numCols * this.cellSize;
    this.myCanvas.height = this.numRows * this.cellSize;
    // this.drawGrid();

    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(
        tap((value) => {
          const ratio = Math.ceil(value);
          // console.log('ratio', ratio);
          this.cellSize = 32 * ratio;
          this.myCanvas.width = this.numCols * this.cellSize;
          this.myCanvas.height = this.numRows * this.cellSize;
          this.getBoardPosition();
          this.drawGrid(ratio);
        })
      )
      .subscribe();
  }

  private getBoardPosition(): void {
    this.boardTop = this.myCanvas.getBoundingClientRect().top;
    this.boardLeft = this.myCanvas.getBoundingClientRect().left;
    this.store.dispatch(
      PentominoActions.updateComponentData({
        entityId: GameObjectsIds.BOARD,
        currentComponent: ComponentType.POSITION,
        changes: { x: this.boardLeft, y: this.boardTop },
      })
    );
  }

  private drawGrid(ratio: number): void {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.myCanvas.width, this.myCanvas.height);
    this.ctx.lineWidth = 0.6 * ratio;
    for (let i = 0; i <= this.numRows; i++) {
      const y = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.myCanvas.width, y);
      this.ctx.stroke();
    }

    // Вертикальные линии
    for (let i = 0; i <= this.numCols; i++) {
      const x = i * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.myCanvas.height);
      this.ctx.stroke();
    }
  }
}

import {
  Component,
  effect,
  inject,
  signal,
  untracked,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";

import { Subject, takeUntil, tap } from "rxjs";
import { ResizeService } from "../../services/resize.service";
import { CanvasParams } from "../../types/canvas-params";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { Entity } from "../../types/entity";
import { BoardRenderService } from "../../services/render-board.service";
import { ComponentType } from "../../constants/component-type.enum";
import { PickComponentType } from "../../types/components";

@Component({
  selector: "game-board",
  imports: [CanvasParamsDirective],
  providers: [BoardRenderService],
  standalone: true,
  template: `
    <canvas
      canvasParams
      [canvasCss]="''"
      [context]="'bitmaprenderer'"
      (canvasParams)="canvasParams.set($event)"
      #canvas
    ></canvas>
  `,
})
export class BoardComponent implements AfterViewInit, OnDestroy {
  private readonly resizeService = inject(ResizeService);
  private readonly gameFacade = inject(GameFacade);
  private readonly boardService = inject(BoardRenderService);
  private readonly destroy$ = new Subject<void>();

  board = toSignal(this.gameFacade.selectBoard(), {
    initialValue: {} as Entity,
  });
  canvasParams = signal<CanvasParams | null>(null);

  private levelChanged = toSignal(
    this.gameFacade.startNextLevel().pipe(
      tap(() => {
        const canvasParams = this.canvasParams();
        const board = this.board();
        if (canvasParams && board) {
          this.boardService.getBoardPosition(board, canvasParams);
        }
      })
    )
  );

  constructor() {
    effect((): void => {
      const board = this.board();
      const canvasParams = this.canvasParams();
      untracked(() => {
        if (canvasParams && board) {
          this.boardService.drawBoard(board, canvasParams);
          this.checkedIsBoardFilled(board);
        }
      });
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(
        tap(() => {
          const canvasParams = this.canvasParams();
          const board = this.board();
          if (canvasParams && board) {
            this.boardService.getBoardPosition(board, canvasParams);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private checkedIsBoardFilled(board: Entity): void {
    const boardMatrix = board.components.entities[
      ComponentType.MATRIX
    ] as PickComponentType<ComponentType.MATRIX>;
    if (!boardMatrix) return;
    const isBoardFilled = boardMatrix.matrix.every((cell) => cell !== 0);
    if (isBoardFilled) {
      this.gameFacade.levelCompleted();
    }
  }
}

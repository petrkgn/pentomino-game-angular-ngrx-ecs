import {
  Component,
  effect,
  inject,
  signal,
  untracked,
  AfterViewInit,
} from "@angular/core";
import { tap } from "rxjs";
import { ResizeService } from "../../services/resize.service";
import { CanvasParams } from "../../types/canvas-params";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { Entity } from "../../types/entity";
import { BoardRenderService } from "../../services/render-board.service";

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
      (canvasParams)="onCanvasParamsChange($event)"
      #canvas
    ></canvas>
  `,
})
export class BoardComponent implements AfterViewInit {
  private readonly resizeService = inject(ResizeService);
  private readonly gameFacade = inject(GameFacade);
  private readonly boardService = inject(BoardRenderService);

  board = toSignal(this.gameFacade.selectBoard(), {
    initialValue: {} as Entity,
  });
  canvasParams = signal<CanvasParams | null>(null);

  constructor() {
    effect((): void => {
      const board = this.board();
      const canvasParams = this.canvasParams();
      untracked(() => {
        if (canvasParams && board) {
          this.boardService.drawBoard(board, canvasParams);
        }
      });
    });
  }

  ngAfterViewInit() {
    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(
        tap(() => {
          const canvasParams = this.canvasParams();
          if (canvasParams) {
            this.boardService.getBoardPosition(this.board(), canvasParams);
          }
        })
      )
      .subscribe();
  }

  onCanvasParamsChange(params: CanvasParams) {
    this.canvasParams.set(params);
  }
}

import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from "@angular/core";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { ResizeService } from "../../services/resize.service";
import { CanvasParams } from "../../types/canvas-params";
import { EntityView } from "../../constants/view.enum";
import { CELL_SIZE } from "../../constants/cell-size";
import { animationFrameScheduler, tap } from "rxjs";
import { Store } from "@ngrx/store";
import { PentominoActions } from "../../store/game/actions";
import { GameObjectsIds } from "../../constants/game-objects-ids.enum";
import { ComponentType } from "../../constants/component-type.enum";
import { RectService } from "../../services/rect.service";
import { Boards } from "../../constants/board-size";

@Component({
  selector: "game-scene",
  imports: [CanvasParamsDirective],
  standalone: true,
  template: ` <canvas
      canvasParams
      (canvasParams)="onCanvasParams($event)"
      #canvas
    ></canvas>
    <img
      #bgImg
      src="https://raw.githubusercontent.com/petrkgn/katamino-game-angular/main/fon.png?raw=true"
    />`,
  styles: `
  img {
   display: none;
  }  
`,
})
export class SceneComponent {
  private readonly resizeService = inject(ResizeService);
  private readonly rectService = inject(RectService);
  private readonly store = inject(Store);

  readonly componentView = EntityView;

  private canvasParams!: CanvasParams;

  cellSize = CELL_SIZE;
  numRows = 5;
  numCols = 5;
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
    const { topLeftX, topLeftY } = this.rectService.getTopLeftCoordinates(
      1280,
      896,
      this.canvasParams.canvasCenter.x,
      this.canvasParams.canvasCenter.y
    );
    this.canvasParams.ctx.lineWidth = 2 * ratio;
    this.canvasParams.ctx.drawImage(
      this.bgImg.nativeElement,
      topLeftX,
      topLeftY,
      1280,
      896
    );

    this.canvasParams.ctx.fillStyle = "red";
    this.canvasParams.ctx.strokeStyle = "green";
    this.canvasParams.ctx.lineWidth = 1;

    for (let i = 0; i <= 56; i++) {
      const y = i * 16;
      // this.canvasParams.ctx.beginPath();
      // this.canvasParams.ctx.moveTo(topLeftX, topLeftY + y);
      // this.canvasParams.ctx.lineTo(topLeftX + 80 * 16, topLeftY + y);
      // this.canvasParams.ctx.stroke();
    }

    // Вертикальные линии
    for (let i = 0; i <= 80; i++) {
      const x = i * 16;
      // this.canvasParams.ctx.beginPath();
      // this.canvasParams.ctx.moveTo(topLeftX + x, topLeftY);
      // this.canvasParams.ctx.lineTo(topLeftX + x, topLeftY + 56 * 16);
      // this.canvasParams.ctx.stroke();
    }

    for (let i = 0; i <= 5; i++) {
      const diff = i * 16 * 6;
      // const shift = i * 22;
      const shift = 22 * i + (i * (i - 1)) / 2;

      if (i === 0) {
        this.store.dispatch(
          PentominoActions.updateComponentData({
            entityId: GameObjectsIds.SHAPE_W,
            componentType: ComponentType.HINT_BOX,
            changes: {
              type: ComponentType.HINT_BOX,
              x: topLeftX + 6 * 16,
              y: topLeftY + diff + shift + 10 * 16,
              width: 6 * 16,
              height: 6 * 16,
            },
          })
        );
      }

      if (i === 1) {
        this.store.dispatch(
          PentominoActions.updateComponentData({
            entityId: GameObjectsIds.SHAPE_X,
            componentType: ComponentType.HINT_BOX,
            changes: {
              type: ComponentType.HINT_BOX,
              x: topLeftX + 6 * 16,
              y: topLeftY + diff + shift + 10 * 16,
              width: 6 * 16,
              height: 6 * 16,
            },
          })
        );
      }

      if (i === 2) {
        this.store.dispatch(
          PentominoActions.updateComponentData({
            entityId: GameObjectsIds.SHAPE_I,
            componentType: ComponentType.HINT_BOX,
            changes: {
              type: ComponentType.HINT_BOX,
              x: topLeftX + 6 * 16,
              y: topLeftY + diff + shift + 10 * 16,
              width: 6 * 16,
              height: 6 * 16,
            },
          })
        );
      }

      if (i === 3) {
        this.store.dispatch(
          PentominoActions.updateComponentData({
            entityId: GameObjectsIds.SHAPE_L,
            componentType: ComponentType.HINT_BOX,
            changes: {
              type: ComponentType.HINT_BOX,
              x: topLeftX + 6 * 16,
              y: topLeftY + diff + shift + 10 * 16,
              width: 6 * 16,
              height: 6 * 16,
            },
          })
        );
      }

      // this.canvasParams.ctx.fillRect(
      //   topLeftX + 6 * 16,
      //   topLeftY + diff + shift + 10 * 16,
      //   6 * 16,
      //   6 * 16
      // );
    }

    for (let i = 0; i <= 5; i++) {
      const diff = i * 16 * 6;
      const shift = 22 * i + (i * (i - 1)) / 2;
      const topLeftDiff = 62 * 16;

      // this.canvasParams.ctx.fillRect(
      //   topLeftX + topLeftDiff + 6 * 16,
      //   topLeftY + diff + shift + 10 * 16,
      //   6 * 16,
      //   6 * 16
      // );
    }
  }
}

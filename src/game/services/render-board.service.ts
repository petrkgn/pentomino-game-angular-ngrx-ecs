import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";

import { RectService } from "./rect.service";
import { CanvasParams } from "../types/canvas-params";
import { Entity } from "../types/entity";
import { CELL_SIZE } from "../constants/cell-size";
import { GameActions } from "../store/game/actions";
import { ComponentType } from "../constants/component-type.enum";
import { PickComponentType } from "../types/components";
import { AssetStore } from "../store/assets/asset-srore";

@Injectable()
export class BoardRenderService {
  private store = inject(Store);
  private assetStore = inject(AssetStore);
  private rectService = inject(RectService);
  private offscreenCanvas: OffscreenCanvas;

  constructor() {
    const { innerWidth: width, innerHeight: height } = window;
    this.offscreenCanvas = new OffscreenCanvas(width, height);
  }

  getBoardPosition(board: Entity, canvasParams: CanvasParams): void {
    const { boardMatrix, boardRatio } = this.getBoardComponents(board);
    const boardPosition = this.rectService.getTopLeftCoordinates(
      (boardMatrix.matrix.length / boardMatrix.rows) *
        CELL_SIZE *
        boardRatio.ratio,
      boardMatrix.rows * CELL_SIZE * boardRatio.ratio,
      canvasParams.canvasCenter.x,
      canvasParams.canvasCenter.y + 80
    );

    this.store.dispatch(
      GameActions.changeScene({
        changes: {
          x: boardPosition.topLeftX,
          y: boardPosition.topLeftY,
        },
      })
    );
  }

  private getBoardComponents(entity: Entity) {
    return {
      positionComponent: entity.components.entities[
        ComponentType.POSITION
      ] as PickComponentType<ComponentType.POSITION>,
      boardView: entity.components.entities[
        ComponentType.VIEW
      ] as PickComponentType<ComponentType.VIEW>,
      boardMatrix: entity.components.entities[
        ComponentType.MATRIX
      ] as PickComponentType<ComponentType.MATRIX>,
      boardRatio: entity.components.entities[
        ComponentType.RATIO
      ] as PickComponentType<ComponentType.RATIO>,
    };
  }

  drawBoard(board: Entity, canvasParams: CanvasParams): void {
    const { ctx, width, height } = canvasParams;
    if (!(ctx instanceof ImageBitmapRenderingContext)) return;

    this.prepareOffscreenCanvas(width, height);

    const { positionComponent, boardView, boardMatrix, boardRatio } =
      this.getBoardComponents(board);
    const { rows, columns } = this.getRowsAndColumns(boardMatrix);

    if (!boardView?.img || positionComponent.x === 0) return;

    const boardImg = this.assetStore.entityMap()[boardView.img]?.img;

    if (!boardImg) return;

    const offscreenCtx = this.offscreenCanvas.getContext("2d");

    if (!offscreenCtx) {
      console.error("Контекст оффскрин канваса недоступен");
      return;
    }

    offscreenCtx.lineWidth = 2 * boardRatio.ratio;
    offscreenCtx.drawImage(
      boardImg,
      positionComponent.x,
      positionComponent.y,
      columns * CELL_SIZE * boardRatio.ratio,
      rows * CELL_SIZE * boardRatio.ratio
    );

    const bitmap = this.offscreenCanvas.transferToImageBitmap();
    ctx.transferFromImageBitmap(bitmap);
  }

  private getRowsAndColumns(matrix: PickComponentType<ComponentType.MATRIX>) {
    return {
      rows: matrix.rows,
      columns: matrix.matrix.length / matrix.rows,
    };
  }

  private prepareOffscreenCanvas(width: number, height: number): void {
    this.offscreenCanvas.width = width;
    this.offscreenCanvas.height = height;
    const ctx = this.offscreenCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    } else {
      console.error("Контекст оффскрин канваса недоступен для очистки");
    }
  }
}

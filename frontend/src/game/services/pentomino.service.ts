import { Injectable } from "@angular/core";
import { ComponentType } from "../constants/component-type.enum";
import { PickComponentType } from "../types/components";
import { Entity } from "../types/entity";

@Injectable({
  providedIn: "root",
})
export class PentominoService {
  constructor() {}

  getMatrix(entity: Entity): number[][] {
    const matrixComponent = this.getComponent<ComponentType.MATRIX>(
      entity,
      ComponentType.MATRIX
    );
    return matrixComponent?.matrix || [];
  }

  getCurrentRatio(entity: Entity): number {
    const ratioComponent = this.getComponent<ComponentType.RATIO>(
      entity,
      ComponentType.RATIO
    );
    return ratioComponent?.ratio || 1;
  }

  canPlacePentomino(
    board: Entity,
    pentomino: Entity,
    cellSize: number
  ): PickComponentType<ComponentType.POSITION> | null {
    const ratio = this.getCurrentRatio(pentomino);
    const boardMatrix = this.getMatrix(board);
    const pentominoMatrix = this.getMatrix(pentomino);
    const diff = -10 * ratio;
    const centerShapePosition = {
      x: (pentominoMatrix[0].length * cellSize * ratio) / 2,
      y: (pentominoMatrix.length * cellSize * ratio) / 2,
    };

    const mouseComponent = this.getComponent<ComponentType.MOUSE>(
      pentomino,
      ComponentType.MOUSE
    );
    const positionComponent = this.getComponent<ComponentType.POSITION>(
      board,
      ComponentType.POSITION
    );
    if (!mouseComponent || !positionComponent) return null;

    const placement = {
      mx: mouseComponent.mx,
      my: mouseComponent.my,
      boardX: positionComponent.x,
      boardY: positionComponent.y,
    };

    if (
      !this.isWithinBounds(
        placement,
        centerShapePosition,
        boardMatrix,
        pentominoMatrix,
        cellSize,
        ratio,
        diff
      )
    ) {
      console.log("!!!!!!");
      return null;
    }

    const placementPosition = {
      x: placement.boardX + placement.mx - centerShapePosition.x,
      y: placement.boardY + placement.my - centerShapePosition.y,
    };

    if (
      this.hasOverlap(
        boardMatrix,
        pentominoMatrix,
        placementPosition,
        cellSize,
        ratio
      )
    ) {
      return null;
    }

    return {
      type: ComponentType.POSITION,
      x: placementPosition.x,
      y: placementPosition.y,
    };
  }

  placePentomino(
    board: Entity,
    pentomino: Entity,
    cellSize: number
  ): Entity | null {
    const placementPosition = this.canPlacePentomino(
      board,
      pentomino,
      cellSize
    );
    if (!placementPosition) return null;

    const boardMatrix = structuredClone(this.getMatrix(board));
    const pentominoMatrix = this.getMatrix(pentomino);
    const ratio = this.getCurrentRatio(pentomino);

    // Start placing pentomino onto the board matrix
    for (let i = 0; i < pentominoMatrix.length; i++) {
      for (let j = 0; j < pentominoMatrix[i].length; j++) {
        if (pentominoMatrix[i][j] !== 0) {
          const cellX = Math.floor(
            (placementPosition.x + j * cellSize * ratio - placementPosition.x) /
              (cellSize * ratio)
          );
          const cellY = Math.floor(
            (placementPosition.y + i * cellSize * ratio - placementPosition.y) /
              (cellSize * ratio)
          );
          boardMatrix[cellY][cellX] = pentominoMatrix[i][j];
        }
      }
    }

    return this.updateEntityMatrix(board, boardMatrix);
  }

  isBoardFilled(board: Entity): boolean {
    const matrix = this.getMatrix(board);
    return matrix.every((row) => row.every((cell) => cell !== 0));
  }

  rotatePentomino(pentomino: Entity): Entity {
    const matrix = this.getMatrix(pentomino);
    const rotatedMatrix = this.rotateMatrix(matrix);
    return this.updateEntityMatrix(pentomino, rotatedMatrix);
  }

  mirrorPentomino(pentomino: Entity): Entity {
    const matrix = this.getMatrix(pentomino);
    const mirroredMatrix = matrix.map((row) => row.reverse());
    return this.updateEntityMatrix(pentomino, mirroredMatrix);
  }

  private getComponent<T extends ComponentType>(
    entity: Entity,
    type: ComponentType
  ): PickComponentType<T> | null {
    return entity.components.find(
      (component) => component.type === type
    ) as PickComponentType<T> | null;
  }

  private isWithinBounds(
    placement: any, // Лучше заменить any на более конкретный тип
    centerShapePosition: any, // Также заменить any на более конкретный тип
    boardMatrix: number[][],
    pentominoMatrix: number[][],
    cellSize: number,
    ratio: number,
    diff: number
  ): boolean {
    const isMouseComponentUndefined =
      placement.mx === undefined || placement.my === undefined;
    const isBoardPositionComponentUndefined =
      placement.boardX === undefined || placement.boardY === undefined;

    // Координаты границ пентамино относительно его центра
    const pentominoLeft = placement.mx - centerShapePosition.x;
    const pentominoRight =
      pentominoLeft + pentominoMatrix[0].length * cellSize * ratio;
    const pentominoTop = placement.my - centerShapePosition.y;
    const pentominoBottom =
      pentominoTop + pentominoMatrix.length * cellSize * ratio;

    // Координаты границ доски
    const boardRight =
      placement.boardX + boardMatrix[0].length * cellSize * ratio;
    const boardBottom =
      placement.boardY + boardMatrix.length * cellSize * ratio;

    // Проверки на выход за пределы поля
    const isPentominoOutsideLeft = pentominoLeft + diff < placement.boardX;
    const isPentominoOutsideRight = pentominoRight + diff > boardRight;
    const isPentominoOutsideTop = pentominoTop + diff < placement.boardY;
    const isPentominoOutsideBottom = pentominoBottom + diff > boardBottom;

    // Проверка на наличие неопределенных компонентов или выход за границы доски
    if (
      placement.mx === undefined ||
      placement.my === undefined ||
      placement.boardX === undefined ||
      placement.boardY === undefined ||
      placement.mx < 0 ||
      placement.my < 0 ||
      placement.mx -
        centerShapePosition.x +
        pentominoMatrix[0].length * cellSize * ratio +
        diff >
        placement.boardX + boardMatrix[0].length * cellSize * ratio ||
      placement.my -
        centerShapePosition.y +
        pentominoMatrix.length * cellSize * ratio +
        diff >
        placement.boardY + boardMatrix.length * cellSize * ratio ||
      placement.mx - centerShapePosition.x - diff < placement.boardX ||
      placement.my + centerShapePosition.y - diff < placement.boardY
    ) {
      return false;
    }

    return true; // Пентамино находится в пределах доски
  }

  private hasOverlap(
    boardMatrix: number[][],
    pentominoMatrix: number[][],
    position: any,
    cellSize: number,
    ratio: number
  ): boolean {
    // Проверяем пересечение пентамино с другими фигурами на доске
    for (let i = 0; i < pentominoMatrix.length; i++) {
      for (let j = 0; j < pentominoMatrix[i].length; j++) {
        // Если в клетке пентамино есть блок
        if (pentominoMatrix[i][j] !== 0) {
          // Вычисляем положение этой клетки на доске
          const cellX = Math.floor(
            (position.x + j * cellSize * ratio - position.boardX) /
              (cellSize * ratio)
          );
          const cellY = Math.floor(
            (position.y + i * cellSize * ratio - position.boardY) /
              (cellSize * ratio)
          );

          // Проверяем, выходит ли клетка за границы доски
          if (
            cellX < 0 ||
            cellX >= boardMatrix[0].length ||
            cellY < 0 ||
            cellY >= boardMatrix.length
          ) {
            return true; // Пересечение за пределами доски
          }

          // Проверяем, свободна ли клетка на доске
          if (boardMatrix[cellY][cellX] !== 0) {
            return true; // Пересечение с другими фигурами
          }
        }
      }
    }

    return false; // Пересечений нет
  }

  private rotateMatrix(matrix: number[][]): number[][] {
    return matrix[0].map((val, index) =>
      matrix.map((row) => row[index]).reverse()
    );
  }

  private updateEntityMatrix(entity: Entity, newMatrix: number[][]): Entity {
    return {
      ...entity,
      components: entity.components.map((component) =>
        component.type === ComponentType.MATRIX
          ? { ...component, matrix: newMatrix }
          : component
      ),
    };
  }
}

import { Injectable } from '@angular/core';
import { ComponentType } from '../constants/component-type.enum';
import { PickComponentType } from '../interfaces/components';
import { Entity } from '../interfaces/entity';

@Injectable({
  providedIn: 'root',
})
export class PentominoService {
  constructor() {}

  /**
   * Retrieves the matrix component from an entity.
   * @param entity The entity from which to retrieve the matrix.
   * @returns The matrix as an array of arrays of numbers or an empty array if no matrix component is found.
   * @private
   */
  private getMatrix(entity: Entity): number[][] {
    const matrixComponent = entity.components.find(
      (component) => component.type === ComponentType.MATRIX
    ) as PickComponentType<ComponentType.MATRIX>;
    return matrixComponent?.matrix || [];
  }

  /**
   * Retrieves the current ratio component from an entity.
   * @param entity The entity from which to retrieve the ratio.
   * @returns The ratio as a number or 1 if no ratio component is found.
   * @private
   */
  private getCurrentRatio(entity: Entity): number {
    const ratioComponent = entity.components.find(
      (component) => component.type === ComponentType.RATIO
    ) as PickComponentType<ComponentType.RATIO>;
    return ratioComponent?.ratio || 1;
  }

  /**
   * Determines whether a pentomino can be placed on the board.
   * @param board The board entity.
   * @param pentomino The pentomino entity.
   * @param cellSize The size of each cell on the board.
   * @returns The position where the pentomino can be placed or null if it cannot be placed.
   * @public
   */
  public canPlacePentomino(
    board: Entity,
    pentomino: Entity,
    cellSize: number
  ): PickComponentType<ComponentType.POSITION> | null {
    const ratio = this.getCurrentRatio(pentomino);
    const boardMatrix = this.getMatrix(board);
    const pentominoMatrix = this.getMatrix(pentomino);
    const pentominoMouseComponent = this.getComponent<
      PickComponentType<ComponentType.MOUSE>
    >(pentomino, ComponentType.MOUSE);
    const boardPositionComponent = this.getComponent<
      PickComponentType<ComponentType.POSITION>
    >(board, ComponentType.POSITION);

    // Validate component positions
    if (
      !this.isValidComponentPosition(
        pentominoMouseComponent,
        boardPositionComponent
      )
    ) {
      return null;
    }

    // Calculate positions
    const { x: centerShapePositionX, y: centerShapePositionY } =
      this.calculateCenterPosition(pentominoMatrix, cellSize, ratio);

    // Check if the pentomino can be placed within the board boundaries
    if (
      !this.isWithinBounds(
        pentominoMouseComponent,
        boardPositionComponent,
        centerShapePositionX,
        centerShapePositionY,
        pentominoMatrix,
        boardMatrix,
        cellSize,
        ratio
      )
    ) {
      return null;
    }

    // Check for collision with other shapes on the board
    if (
      this.hasCollision(
        pentominoMouseComponent,
        boardPositionComponent,
        pentominoMatrix,
        boardMatrix,
        centerShapePositionX,
        centerShapePositionY,
        cellSize,
        ratio
      )
    ) {
      return null;
    }

    // If no collision and within bounds, return the new position
    return {
      type: ComponentType.POSITION,
      x: pentominoMouseComponent.mx + 5 * ratio,
      y: pentominoMouseComponent.my - 5 * ratio,
    };
  }

  /**
   * Retrieves a specific component from an entity based on the component type.
   * @param entity The entity from which the component will be retrieved.
   * @param type The type of the component to retrieve.
   * @returns The requested component if found, otherwise undefined.
   * @template T The expected type of the component.
   * @private
   */
  private getComponent<T>(entity: Entity, type: ComponentType): T {
    return entity.components.find((component) => component.type === type) as T;
  }

  /**
   * Validates if the necessary components (like MOUSE and POSITION) have valid positions.
   * This is a helper method used to ensure that position-related components are properly defined before proceeding with calculations.
   * @param mouseComponent The MOUSE component of the pentomino.
   * @param positionComponent The POSITION component of the board.
   * @returns True if both components have valid positions, false otherwise.
   * @private
   */
  private isValidComponentPosition(
    mouseComponent: PickComponentType<ComponentType.MOUSE>,
    positionComponent: PickComponentType<ComponentType.POSITION>
  ): boolean {
    return !(
      mouseComponent.mx === undefined ||
      mouseComponent.my === undefined ||
      positionComponent.x === undefined ||
      positionComponent.y === undefined
    );
  }

  /**
   * Calculates the center position of a shape based on its matrix, cell size, and current scale ratio.
   * This method is used to determine the central point of a pentomino for positioning and collision detection.
   * @param matrix The matrix representing the shape of the pentomino.
   * @param cellSize The size of each cell on the board.
   * @param ratio The current scale ratio applied to the pentomino.
   * @returns An object containing the calculated center X and Y positions.
   * @private
   */
  private calculateCenterPosition(
    matrix: number[][],
    cellSize: number,
    ratio: number
  ): { x: number; y: number } {
    return {
      x: (matrix[0].length * cellSize * ratio) / 2,
      y: (matrix.length * cellSize * ratio) / 2,
    };
  }

  /**
   * Checks if the pentomino is within the boundaries of the board.
   * @param mouseComponent The mouse component of the pentomino.
   * @param positionComponent The position component of the board.
   * @param centerShapePositionX The calculated center X position of the pentomino.
   * @param centerShapePositionY The calculated center Y position of the pentomino.
   * @param pentominoMatrix The matrix of the pentomino.
   * @param boardMatrix The matrix of the board.
   * @param cellSize The size of each cell on the board.
   * @param ratio The current scale ratio.
   * @returns True if the pentomino is within bounds, false otherwise.
   * @private
   */
  private isWithinBounds(
    mouseComponent: PickComponentType<ComponentType.MOUSE>,
    positionComponent: PickComponentType<ComponentType.POSITION>,
    centerShapePositionX: number,
    centerShapePositionY: number,
    pentominoMatrix: number[][],
    boardMatrix: number[][],
    cellSize: number,
    ratio: number
  ): boolean {
    const diff = -10 * ratio; // Adjust based on specific game logic
    return (
      mouseComponent.mx >= positionComponent.x &&
      mouseComponent.my >= positionComponent.y &&
      mouseComponent.mx -
        centerShapePositionX +
        pentominoMatrix[0].length * cellSize * ratio +
        diff <=
        positionComponent.x + boardMatrix[0].length * cellSize * ratio &&
      mouseComponent.my -
        centerShapePositionY +
        pentominoMatrix.length * cellSize * ratio +
        diff <=
        positionComponent.y + boardMatrix.length * cellSize * ratio
    );
  }

  /**
   * Checks if placing the pentomino on the board would cause a collision with existing pieces.
   * @param mouseComponent The mouse component of the pentomino.
   * @param positionComponent The position component of the board.
   * @param pentominoMatrix The matrix of the pentomino.
   * @param boardMatrix The matrix of the board.
   * @param centerShapePositionX The calculated center X position of the pentomino.
   * @param centerShapePositionY The calculated center Y position of the pentomino.
   * @param cellSize The size of each cell on the board.
   * @param ratio The current scale ratio.
   * @returns True if there is a collision, false otherwise.
   * @private
   */
  private hasCollision(
    mouseComponent: PickComponentType<ComponentType.MOUSE>,
    positionComponent: PickComponentType<ComponentType.POSITION>,
    pentominoMatrix: number[][],
    boardMatrix: number[][],
    centerShapePositionX: number,
    centerShapePositionY: number,
    cellSize: number,
    ratio: number
  ): boolean {
    for (let i = 0; i < pentominoMatrix.length; i++) {
      for (let j = 0; j < pentominoMatrix[i].length; j++) {
        if (pentominoMatrix[i][j] !== 0) {
          // Check only filled cells of the pentomino
          const cellX =
            Math.round(
              (mouseComponent.mx - centerShapePositionX - positionComponent.x) /
                (cellSize * ratio)
            ) + j;
          const cellY =
            Math.round(
              (mouseComponent.my - centerShapePositionY - positionComponent.y) /
                (cellSize * ratio)
            ) + i;

          // Check if the calculated position is out of the board bounds
          if (
            cellX < 0 ||
            cellX >= boardMatrix[0].length ||
            cellY < 0 ||
            cellY >= boardMatrix.length
          ) {
            return true; // Out of bounds
          }

          // Check if the calculated position collides with an existing piece on the board
          if (boardMatrix[cellY][cellX] !== 0) {
            return true; // Collision detected
          }
        }
      }
    }
    return false; // No collision detected
  }

  /**
   * Places a pentomino on the board if possible.
   * @param board The board entity.
   * @param pentomino The pentomino entity.
   * @param cellSize The size of each cell on the board.
   * @returns A new board entity with the pentomino placed or null if the pentomino cannot be placed.
   * @public
   */
  public placePentomino(
    board: Entity,
    pentomino: Entity,
    cellSize: number
  ): Entity | null {
    if (this.canPlacePentomino(board, pentomino, cellSize)) {
      const boardMatrix = this.getMatrix(board);
      const pentominoMatrix = this.getMatrix(pentomino);
      const ratio = this.getCurrentRatio(pentomino);
      const centerShapePositionX =
        ((pentominoMatrix[0].length * cellSize) / 2) * ratio;
      const centerShapePositionY =
        ((pentominoMatrix.length * cellSize) / 2) * ratio;
      const pentominoPositionComponent = pentomino.components.find(
        (component) => component.type === ComponentType.MOUSE
      ) as PickComponentType<ComponentType.MOUSE>;

      const boardPositionComponent = board.components.find(
        (component) => component.type === ComponentType.POSITION
      ) as PickComponentType<ComponentType.POSITION>;

      if (
        !pentominoPositionComponent ||
        pentominoPositionComponent.mx === undefined ||
        pentominoPositionComponent.my === undefined
      ) {
        return null;
      }

      // Копируем матрицу поля
      const newBoardMatrix = structuredClone(boardMatrix);

      // Объединяем матрицы пентомино и поля
      for (let i = 0; i < pentominoMatrix.length; i++) {
        for (let j = 0; j < pentominoMatrix[i].length; j++) {
          if (pentominoMatrix[i][j] !== 0) {
            const cellX =
              Math.round(
                ((pentominoPositionComponent.mx -
                  centerShapePositionX -
                  boardPositionComponent.x) /
                  cellSize) *
                  ratio
              ) + j;

            const cellY =
              Math.round(
                ((pentominoPositionComponent.my -
                  centerShapePositionY -
                  boardPositionComponent.y) /
                  cellSize) *
                  ratio
              ) + i;

            newBoardMatrix[cellY][cellX] = pentominoMatrix[i][j];
          }
        }
      }

      // Возвращаем новый объект доски с обновленной матрицей
      return {
        ...board,
        components: board.components.map((component) =>
          component.type === ComponentType.MATRIX
            ? { ...component, matrix: newBoardMatrix }
            : component
        ),
      };
    }

    return null;
  }

  /**
   * Checks whether the board is completely filled with pentominoes.
   * @param board The board entity to check.
   * @returns True if the board is completely filled, false otherwise.
   * @public
   */
  public isBoardFilled(board: Entity): boolean {
    const matrix = this.getMatrix(board);
    return matrix.every((row) => row.every((cell) => cell === 1));
  }

  /**
   * Rotates a pentomino by 90 degrees clockwise.
   * @param pentomino The pentomino entity to rotate.
   * @returns A new pentomino entity after rotation.
   * @public
   */
  public rotatePentomino(pentomino: Entity): Entity {
    const originalMatrix = this.getMatrix(pentomino);
    const rotatedMatrix = originalMatrix[0].map((val, index) =>
      originalMatrix.map((row) => row[index]).reverse()
    );
    return {
      ...pentomino,
      components: pentomino.components.map((component) =>
        component.type === ComponentType.MATRIX
          ? { ...component, matrix: rotatedMatrix }
          : component
      ),
    };
  }

  /**
   * Creates a mirrored version of a pentomino.
   * @param pentomino The pentomino entity to mirror.
   * @returns A new pentomino entity after mirroring.
   * @public
   */
  public mirrorPentomino(pentomino: Entity): Entity {
    const originalMatrix = this.getMatrix(pentomino);
    const mirroredMatrix = originalMatrix.map((row) => [...row].reverse());
    return {
      ...pentomino,
      components: pentomino.components.map((component) =>
        component.type === ComponentType.MATRIX
          ? { ...component, matrix: mirroredMatrix }
          : component
      ),
    };
  }
}

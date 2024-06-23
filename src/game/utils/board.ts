import { ComponentType } from "../constants/component-type.enum";
import { PickComponentType } from "../types/components";
import { Entity } from "../types/entity";
import { CELL_SIZE } from "../constants/cell-size";

interface PlacementData {
  ratio: number;
  boardMatrix: PickComponentType<ComponentType.MATRIX>;
  pentominoMatrix: PickComponentType<ComponentType.MATRIX>;
  centerShapePositionX: number;
  centerShapePositionY: number;
  shapePositionComponent: PickComponentType<ComponentType.POSITION>;
  boardPositionComponent: PickComponentType<ComponentType.POSITION>;
}

/**
 * Класс для управления игровой доской и размещением фигур.
 */
class BoardGame {
  private cellSize = CELL_SIZE;
  /**
   * Извлекает матрицу из сущности.
   * @param entity Сущность для получения матрицы.
   * @returns Матрица или пустой массив, если компонент матрицы отсутствует.
   */
  private getMatrix(entity: Entity): PickComponentType<ComponentType.MATRIX> {
    const matrixComponent = entity.components.entities[
      ComponentType.MATRIX
    ] as PickComponentType<ComponentType.MATRIX>;
    return {
      type: ComponentType.MATRIX,
      rows: matrixComponent?.rows ?? 0,
      matrix: matrixComponent?.matrix ?? [],
    };
  }

  /**
   * Возвращает текущее соотношение сущности.
   * @param entity Сущность для получения соотношения.
   * @returns Соотношение или 1, если компонент соотношения отсутствует.
   */
  private getCurrentRatio(entity: Entity): number {
    const ratioComponent = entity.components.entities[
      ComponentType.RATIO
    ] as PickComponentType<ComponentType.RATIO>;
    return ratioComponent?.ratio ?? 1;
  }

  /**
   * Возвращает текущее местоположение сущности.
   * @param entity Сущность для получения данных о местоположении.
   * @returns Местоположение или null, если компонент местоположения отсутствует.
   */
  private getCurrentPlacement(
    entity: Entity
  ): PickComponentType<ComponentType.PLACEMENT> | null {
    const placementComponent = entity.components.entities[
      ComponentType.PLACEMENT
    ] as PickComponentType<ComponentType.PLACEMENT>;
    return placementComponent ?? null;
  }

  /**
   * Подготавливает данные для размещения фигуры на доске.
   * @param board Доска для размещения.
   * @param pentomino Фигура для размещения.
   * @returns Объект с данными для размещения.
   */
  private preparePlacementData(
    board: Entity,
    pentomino: Entity
  ): PlacementData | null {
    const ratio = this.getCurrentRatio(pentomino);
    const boardMatrix = this.getMatrix(board);
    const pentominoMatrix = this.getMatrix(pentomino);
    const rows = pentominoMatrix.rows;
    const columns = pentominoMatrix.matrix.length / rows;

    const centerShapePositionX = columns * this.cellSize * ratio * 0.5;
    const centerShapePositionY = rows * this.cellSize * ratio * 0.5;

    const shapePositionComponent = pentomino.components.entities[
      ComponentType.POSITION
    ] as PickComponentType<ComponentType.POSITION>;
    const boardPositionComponent = board.components.entities[
      ComponentType.POSITION
    ] as PickComponentType<ComponentType.POSITION>;

    if (!shapePositionComponent || !boardPositionComponent) {
      return null;
    }

    return {
      ratio,
      boardMatrix,
      pentominoMatrix,
      centerShapePositionX,
      centerShapePositionY,
      shapePositionComponent,
      boardPositionComponent,
    };
  }

  /**
   * Проверяет, неопределены ли координаты компонентов.
   * @param data Данные для проверки.
   * @returns true если координаты не определены, иначе false.
   */
  private hasUndefinedCoordinates(data: PlacementData): boolean {
    return (
      data.shapePositionComponent.x === undefined ||
      data.shapePositionComponent.y === undefined ||
      data.boardPositionComponent.x === undefined ||
      data.boardPositionComponent.y === undefined
    );
  }

  /**
   * Возвращает координаты верхнего левого угла ячейки, в которой находится центр фигуры.
   *
   * @param {PlacementData} data - Данные, необходимые для вычисления позиции ячейки.
   * @return {Object} - Координаты ячейки.
   * @property {number} cellX - Координата по оси X.
   * @property {number} cellY - Координата по оси Y.
   */
  private getBoardCellPosition(data: PlacementData): {
    cellX: number;
    cellY: number;
  } {
    const {
      shapePositionComponent,
      centerShapePositionX,
      centerShapePositionY,
      boardPositionComponent,
      ratio,
    } = data;
    const cellX = Math.round(
      (shapePositionComponent.x -
        centerShapePositionX -
        boardPositionComponent.x) /
        (this.cellSize * ratio)
    );
    const cellY = Math.round(
      (shapePositionComponent.y -
        centerShapePositionY -
        boardPositionComponent.y) /
        (this.cellSize * ratio)
    );

    return { cellX, cellY };
  }

  /**
   * Возвращает количество строк и столбцов в матрице.
   * @param {PickComponentType<ComponentType.MATRIX>} matrixData - Матрица.
   * @return {Object} - Количество строк и столбцов.
   * @property {number} rows - Количество строк.
   * @property {number} columns - Количество столбцов.
   */
  private getRowsAndColumns(
    matrixData: PickComponentType<ComponentType.MATRIX>
  ): {
    rows: number;
    columns: number;
  } {
    return {
      rows: matrixData.rows,
      columns: matrixData.matrix.length / matrixData.rows,
    };
  }

  /**
   * Проверяет, выходит ли фигура за границы доски.
   * @param data Данные для проверки.
   * @returns true если фигура выходит за границы, иначе false.
   */
  private isOutOfBounds(data: PlacementData): boolean {
    const {
      shapePositionComponent,
      boardPositionComponent,
      boardMatrix,
      pentominoMatrix,
      ratio,
    } = data;
    const diff = -10 * ratio;

    const { rows: boardRows, columns: boardColumns } =
      this.getRowsAndColumns(boardMatrix);
    const { rows: pentominoRows, columns: pentominoColumns } =
      this.getRowsAndColumns(pentominoMatrix);

    const boardWidth = boardColumns * this.cellSize * ratio;
    const boardHeight = boardRows * this.cellSize * ratio;
    const shapeWidth = pentominoColumns * this.cellSize * ratio;
    const shapeHeight = pentominoRows * this.cellSize * ratio;

    const shapeLeftX = shapePositionComponent.x - shapeWidth / 2;
    const shapeRightX = shapePositionComponent.x + shapeWidth / 2;
    const shapeTopY = shapePositionComponent.y - shapeHeight / 2;
    const shapeBottomY = shapePositionComponent.y + shapeHeight / 2;

    return (
      shapeLeftX - diff < boardPositionComponent.x ||
      shapeRightX + diff > boardPositionComponent.x + boardWidth ||
      shapeTopY - diff < boardPositionComponent.y ||
      shapeBottomY + diff > boardPositionComponent.y + boardHeight
    );
  }

  /**
   * Checks if the shape intersects with other shapes on the board.
   * @param data Data for the check.
   * @returns True if there are intersections, otherwise false.
   */
  private intersectsOtherShapes(data: PlacementData): boolean {
    const { boardMatrix, pentominoMatrix } = data;
    const { rows: boardRows, columns: boardColumns } =
      this.getRowsAndColumns(boardMatrix);
    const { rows: pentominoRows, columns: pentominoColumns } =
      this.getRowsAndColumns(pentominoMatrix);

    for (let row = 0; row < pentominoRows; row++) {
      for (let col = 0; col < pentominoColumns; col++) {
        const pentominoValue =
          pentominoMatrix.matrix[row * pentominoColumns + col];
        if (pentominoValue !== 0) {
          const { cellX, cellY } = this.getBoardCellPosition(data);
          const boardX = cellX + col;
          const boardY = cellY + row;

          if (
            boardX < 0 ||
            boardX >= boardColumns ||
            boardY < 0 ||
            boardY >= boardRows
          ) {
            continue;
          }

          if (boardMatrix.matrix[boardY * boardColumns + boardX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Определяет, можно ли разместить фигуру на доске.
   * @param board Доска для размещения.
   * @param pentomino Фигура для размещения.
   * @returns true если можно разместить, иначе false.
   */
  private canPlacePentomino(board: Entity, pentomino: Entity): boolean {
    const placementData = this.preparePlacementData(board, pentomino);

    if (!placementData) return false;

    const undefinedCoords = this.hasUndefinedCoordinates(placementData);
    const outOfBounds = this.isOutOfBounds(placementData);
    const intersects = this.intersectsOtherShapes(placementData);

    if (undefinedCoords || outOfBounds || intersects) {
      return false;
    }
    return true;
  }

  /**
   * Получает позицию для размещения фигуры на доске. Определяет, можно ли разместить
   * фигуру в заданной позиции на доске, и возвращает позиционный компонент, если размещение возможно.
   *
   * @param {Entity} board Доска, на которой нужно разместить фигуру.
   * @param {Entity} pentomino Фигура, которую нужно разместить.
   * @returns {PickComponentType<ComponentType.PLACEMENT> | null} Объект с типом размещения и координатами
   * на доске, если размещение возможно, иначе null.
   */
  public getPlacementPosition(
    board: Entity,
    pentomino: Entity
  ): PickComponentType<ComponentType.PLACEMENT> | null {
    if (this.canPlacePentomino(board, pentomino)) {
      const data = this.preparePlacementData(board, pentomino);

      if (!data) return null;

      const { cellX, cellY } = this.getBoardCellPosition(data);

      return {
        type: ComponentType.PLACEMENT,
        cellX,
        cellY,
      };
    }
    return null;
  }

  /**
   * Пересчитывает позицию фигуры на доске. Использует текущие данные размещения для определения новых
   * координат фигуры с учетом её размера и позиции на доске.
   *
   * @param {Entity} board Доска, на которой размещена фигура.
   * @param {Entity} pentomino Фигура, для которой необходимо пересчитать позицию.
   * @param {PickComponentType<ComponentType.PLACEMENT> | null} placementPosition Текущее положение фигуры,
   * используемое для пересчета. Если не задано, используется текущее положение фигуры.
   * @returns {PickComponentType<ComponentType.POSITION> | null} Новый позиционный компонент с координатами x и y,
   * если пересчет возможен, иначе null.
   */
  public recalculateShapePosition(
    board: Entity,
    pentomino: Entity,
    placementPosition: PickComponentType<ComponentType.PLACEMENT> | null = null
  ): PickComponentType<ComponentType.POSITION> | null {
    const currentData = this.preparePlacementData(board, pentomino);
    const currentPlacement =
      placementPosition ?? this.getCurrentPlacement(pentomino);
    if (!currentData || !currentPlacement) {
      return null;
    }

    const newPlacementX =
      currentData.boardPositionComponent.x +
      currentData.centerShapePositionX +
      currentPlacement.cellX * this.cellSize * currentData.ratio;
    const newPlacementY =
      currentData.boardPositionComponent.y +
      currentData.centerShapePositionY +
      currentPlacement.cellY * this.cellSize * currentData.ratio;

    return {
      type: ComponentType.POSITION,
      x: newPlacementX,
      y: newPlacementY,
    };
  }

  /**
   * Updates the board matrix component after placing a pentomino.
   * @param board The board to update.
   * @param pentomino The pentomino to place.
   * @returns The updated board matrix or null if the pentomino cannot be placed.
   */
  public updateBoardMatrix(board: Entity, pentomino: Entity): number[] | null {
    const placementData = this.preparePlacementData(board, pentomino);

    if (!placementData || !this.canPlacePentomino(board, pentomino)) {
      return null;
    }

    const { cellX, cellY } = this.getBoardCellPosition(placementData);

    const { boardMatrix, pentominoMatrix } = placementData;
    const boardMatrixUpdated = [...boardMatrix.matrix];
    const pentominoMatrixCopy = [...pentominoMatrix.matrix];

    const { rows: pentominoRows, columns: pentominoColumns } =
      this.getRowsAndColumns(pentominoMatrix);

    const { columns: boardCols } = this.getRowsAndColumns(boardMatrix);

    for (let row = 0; row < pentominoRows; row++) {
      for (let col = 0; col < pentominoColumns; col++) {
        const pentominoValue =
          pentominoMatrixCopy[row * pentominoColumns + col];
        if (pentominoValue !== 0) {
          const boardIndex = (cellY + row) * boardCols + (cellX + col);
          boardMatrixUpdated[boardIndex] = pentominoValue;
        }
      }
    }

    return boardMatrixUpdated;
  }

  /**
   * Проверяет, полностью ли заполнена доска пентамино.
   * @param board Доска для проверки.
   * @returns true, если доска полностью заполнена; иначе false.
   */
  public isBoardFilled(board: Entity): boolean {
    const matrixComponent = board.components.entities[
      ComponentType.MATRIX
    ] as PickComponentType<ComponentType.MATRIX>;

    if (!matrixComponent) {
      return false;
    }

    const matrix = matrixComponent.matrix;
    return matrix.every((cell) => cell === 1);
  }
}

export default BoardGame;

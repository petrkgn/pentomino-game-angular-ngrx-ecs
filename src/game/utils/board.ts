import { ComponentType } from "../constants/component-type.enum";
import { PickComponentType } from "../interfaces/components";
import { Entity } from "../interfaces/entity";
import { CELL_SIZE } from "../constants/cell-size";

interface PlacementData {
  ratio: number;
  boardMatrix: PickComponentType<ComponentType.MATRIX>;
  pentominoMatrix: PickComponentType<ComponentType.MATRIX>;
  centerShapePositionX: number;
  centerShapePositionY: number;
  shapeMouseComponent: PickComponentType<ComponentType.MOUSE>;
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
    const matrixComponent = entity.components.find(
      (component) => component.type === ComponentType.MATRIX
    ) as PickComponentType<ComponentType.MATRIX>;
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
    const ratioComponent = entity.components.find(
      (component) => component.type === ComponentType.RATIO
    ) as PickComponentType<ComponentType.RATIO>;
    return ratioComponent.ratio ?? 1;
  }

  /**
   * Возвращает текущее местоположение сущности.
   * @param entity Сущность для получения данных о местоположении.
   * @returns Местоположение или null, если компонент местоположения отсутствует.
   */
  private getCurrentPlacement(
    entity: Entity
  ): PickComponentType<ComponentType.PLACEMENT> | null {
    const placementComponent = entity.components.find(
      (component) => component.type === ComponentType.PLACEMENT
    ) as PickComponentType<ComponentType.PLACEMENT>;
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

    const shapeMouseComponent = pentomino.components.find(
      (component) => component.type === ComponentType.MOUSE
    ) as PickComponentType<ComponentType.MOUSE>;

    const boardPositionComponent = board.components.find(
      (component) => component.type === ComponentType.POSITION
    ) as PickComponentType<ComponentType.POSITION>;

    if (!shapeMouseComponent || !boardPositionComponent) {
      return null;
    }

    return {
      ratio,
      boardMatrix,
      pentominoMatrix,
      centerShapePositionX,
      centerShapePositionY,
      shapeMouseComponent,
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
      data.shapeMouseComponent.mx === undefined ||
      data.shapeMouseComponent.my === undefined ||
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
      shapeMouseComponent,
      centerShapePositionX,
      centerShapePositionY,
      boardPositionComponent,
      ratio,
    } = data;
    const cellX = Math.round(
      (shapeMouseComponent.mx -
        centerShapePositionX -
        boardPositionComponent.x) /
        (this.cellSize * ratio)
    );
    const cellY = Math.round(
      (shapeMouseComponent.my -
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
  private getRowAndColumn(
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
      shapeMouseComponent,
      boardPositionComponent,
      boardMatrix,
      pentominoMatrix,
      ratio,
    } = data;
    const diff = -10 * ratio;

    const { rows: boardRows, columns: boardColumns } =
      this.getRowAndColumn(boardMatrix);
    const { rows: pentominoRows, columns: pentominoColumns } =
      this.getRowAndColumn(pentominoMatrix);

    const boardWidth = boardColumns * this.cellSize * ratio;
    const boardHeight = boardRows * this.cellSize * ratio;
    const shapeWidth = pentominoColumns * this.cellSize * ratio;
    const shapeHeight = pentominoRows * this.cellSize * ratio;

    const shapeLeftX = shapeMouseComponent.mx - shapeWidth / 2;
    const shapeRightX = shapeMouseComponent.mx + shapeWidth / 2;
    const shapeTopY = shapeMouseComponent.my - shapeHeight / 2;
    const shapeBottomY = shapeMouseComponent.my + shapeHeight / 2;

    return (
      shapeLeftX - diff < boardPositionComponent.x ||
      shapeRightX + diff > boardPositionComponent.x + boardWidth ||
      shapeTopY - diff < boardPositionComponent.y ||
      shapeBottomY + diff > boardPositionComponent.y + boardHeight
    );
  }

  /**
   * Проверяет, пересекается ли фигура с другими фигурами на доске.
   * @param data Данные для проверки.
   * @returns true если есть пересечения, иначе false.
   */
  private intersectsOtherShapes(data: PlacementData): boolean {
    const { boardMatrix, pentominoMatrix } = data;
    const { rows: boardRows, columns: boardColumns } =
      this.getRowAndColumn(boardMatrix);
    const { rows: pentominoRows, columns: pentominoColumns } =
      this.getRowAndColumn(pentominoMatrix);

    for (let i = 0; i < pentominoRows; i++) {
      for (let j = 0; j < pentominoColumns; j++) {
        if (pentominoMatrix.matrix[i * pentominoColumns + j] !== 0) {
          const { cellX, cellY } = this.getBoardCellPosition(data);
          const placementX = cellX + j;
          const placementY = cellY + i;

          if (
            placementY < 0 ||
            placementY >= boardRows ||
            placementX < 0 ||
            placementX >= boardColumns
          ) {
            continue; // Пропустить несуществующие индексы, чтобы избежать ошибок времени выполнения
          }

          if (
            boardMatrix.matrix[placementY * boardColumns + placementX] !== 0
          ) {
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
}

export default BoardGame;

import { ComponentType } from '../constants/component-type.enum';
import { PickComponentType } from '../interfaces/components';
import { Entity } from '../interfaces/entity';

interface PlacementData {
  ratio: number;
  boardMatrix: number[][];
  pentominoMatrix: number[][];
  centerShapePositionX: number;
  centerShapePositionY: number;
  shapeMouseComponent: PickComponentType<ComponentType.MOUSE>;
  boardPositionComponent: PickComponentType<ComponentType.POSITION>;
}

/**
 * Класс для управления игровой доской и размещением фигур.
 */
class BoardGame {
  private cellSize: number;

  /**
   * Создает экземпляр игровой доски.
   * @param cellSize Размер ячейки доски.
   */
  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  /**
   * Извлекает матрицу из сущности.
   * @param entity Сущность для получения матрицы.
   * @returns Матрица или пустой массив, если компонент матрицы отсутствует.
   */
  private getMatrix(entity: Entity): number[][] {
    const matrixComponent = entity.components.find(
      (component) => component.type === ComponentType.MATRIX
    ) as PickComponentType<ComponentType.MATRIX>;
    return matrixComponent.matrix ?? [];
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

    const centerShapePositionX =
      (pentominoMatrix[0].length * this.cellSize * ratio) / 2;
    const centerShapePositionY =
      (pentominoMatrix.length * this.cellSize * ratio) / 2;

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
    const boardWidth = boardMatrix[0].length * this.cellSize * ratio;
    const boardHeight = boardMatrix.length * this.cellSize * ratio;
    const shapeWidth = pentominoMatrix[0].length * this.cellSize * ratio;
    const shapeHeight = pentominoMatrix.length * this.cellSize * ratio;

    const shapeLeftX = shapeMouseComponent.mx - shapeWidth / 2;
    const shapeRightX = shapeMouseComponent.mx + shapeWidth / 2;
    const shapeTopY = shapeMouseComponent.my - shapeHeight / 2;
    const shapeBottomY = shapeMouseComponent.my + shapeHeight / 2;

    return (
      shapeLeftX < boardPositionComponent.x ||
      shapeRightX > boardPositionComponent.x + boardWidth ||
      shapeTopY < boardPositionComponent.y ||
      shapeBottomY > boardPositionComponent.y + boardHeight
    );
  }

  /**
   * Проверяет, пересекается ли фигура с другими фигурами на доске.
   * @param data Данные для проверки.
   * @returns true если есть пересечения, иначе false.
   */
  private intersectsOtherShapes(data: PlacementData): boolean {
    const {
      boardMatrix,
      pentominoMatrix,
      shapeMouseComponent,
      boardPositionComponent,
      centerShapePositionX,
      centerShapePositionY,
      ratio,
    } = data;

    for (let i = 0; i < pentominoMatrix.length; i++) {
      for (let j = 0; j < pentominoMatrix[i].length; j++) {
        if (pentominoMatrix[i][j] !== 0) {
          const placementX =
            Math.round(
              (shapeMouseComponent.mx -
                centerShapePositionX -
                boardPositionComponent.x) /
                (this.cellSize * ratio)
            ) + j;
          const placementY =
            Math.round(
              (shapeMouseComponent.my -
                centerShapePositionY -
                boardPositionComponent.y) /
                (this.cellSize * ratio)
            ) + i;

          if (
            !boardMatrix[placementY] ||
            boardMatrix[placementY][placementX] === undefined
          ) {
            continue; // Skip non-existing indices to avoid runtime errors
          }

          if (boardMatrix[placementY][placementX] !== 0) {
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

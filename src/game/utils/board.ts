import { ComponentType } from '../constants/component-type.enum';
import { PickComponentType } from '../interfaces/components';
import { Entity } from '../interfaces/entity';

interface IPlacementData {
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
    return matrixComponent?.matrix || [];
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
    return ratioComponent?.ratio || 1;
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
  ): IPlacementData | null {
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
      throw new Error('Critical components are missing');
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
  private hasUndefinedCoordinates(data: IPlacementData): boolean {
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
  private isOutOfBounds(data: IPlacementData): boolean {
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
  private intersectsOtherShapes(data: IPlacementData): boolean {
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
   * Возвращает координаты для размещения фигуры на доске, если это возможно.
   * @param board Доска, на которой предполагается разместить фигуру.
   * @param pentomino Фигура, которую требуется разместить.
   * @returns Координаты для размещения или null, если размещение невозможно.
   */
  public getPlacementCoordinates(
    board: Entity,
    pentomino: Entity
  ): PickComponentType<ComponentType.POSITION> | null {
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

      const placementX =
        boardPositionComponent.x +
        centerShapePositionX +
        cellX * this.cellSize * ratio;
      const placementY =
        boardPositionComponent.y +
        centerShapePositionY +
        cellY * this.cellSize * ratio;

      return {
        type: ComponentType.POSITION,
        x: placementX,
        y: placementY,
      };
    }
    return null;
  }

  /**
   * Обновляет координаты фигуры на доске при изменении соотношения масштабирования.
   * @param board Игровая доска с новыми значениями ratio.
   * @param pentomino Фигура с текущими координатами.
   * @param newRatio Новое значение ratio.
   * @returns Новые координаты фигуры или null, если фигура не может быть размещена с новыми параметрами.
   */
  public updatePentominoCoordinates(
    board: Entity,
    pentomino: Entity,
    newRatio: number
  ): PickComponentType<ComponentType.POSITION> | null {
    // Получаем текущие данные для размещения
    const currentData = this.preparePlacementData(board, pentomino);
    if (!currentData) return null;

    const {
      shapeMouseComponent,
      centerShapePositionX,
      centerShapePositionY,
      boardPositionComponent,
    } = currentData;

    // Рассчитываем текущие координаты центра фигуры на доске
    const currentCenterX = shapeMouseComponent.mx;
    const currentCenterY = shapeMouseComponent.my;

    // Рассчитываем новые координаты центра фигуры с использованием нового ratio
    const newCenterShapePositionX =
      (currentData.pentominoMatrix[0].length * this.cellSize * newRatio) / 2;
    const newCenterShapePositionY =
      (currentData.pentominoMatrix.length * this.cellSize * newRatio) / 2;

    // Новые абсолютные координаты на доске
    const newPlacementX =
      ((currentCenterX - boardPositionComponent.x - centerShapePositionX) /
        currentData.ratio) *
        newRatio +
      boardPositionComponent.x +
      newCenterShapePositionX;
    const newPlacementY =
      ((currentCenterY - boardPositionComponent.y - centerShapePositionY) /
        currentData.ratio) *
        newRatio +
      boardPositionComponent.y +
      newCenterShapePositionY;

    // Проверяем, можно ли разместить фигуру на новом месте с новым ratio
    const newPlacementData = {
      ...currentData,
      ratio: newRatio,
      centerShapePositionX: newCenterShapePositionX,
      centerShapePositionY: newCenterShapePositionY,
      shapeMouseComponent: {
        ...shapeMouseComponent,
        mx: newPlacementX,
        my: newPlacementY,
      }, // Создаем копию с обновленными координатами
    };

    if (
      this.isOutOfBounds(newPlacementData) ||
      this.intersectsOtherShapes(newPlacementData)
    ) {
      return null;
    }

    return {
      type: ComponentType.POSITION,
      x: newPlacementX,
      y: newPlacementY,
    };
  }
}

export default BoardGame;

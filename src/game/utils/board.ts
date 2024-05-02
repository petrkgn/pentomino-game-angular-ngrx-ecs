import { ComponentType } from '../constants/component-type.enum';
import { PickComponentType } from '../interfaces/components';
import { Entity } from '../interfaces/entity';

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
  private preparePlacementData(board: Entity, pentomino: Entity) {
    const ratio = this.getCurrentRatio(pentomino);
    const boardMatrix = this.getMatrix(board);
    const pentominoMatrix = this.getMatrix(pentomino);

    const centerShapePositionX = (pentominoMatrix[0].length * this.cellSize * ratio) / 2;
    const centerShapePositionY = (pentominoMatrix.length * this.cellSize * ratio) / 2;

    const mouseComponent = pentomino.components.find(
      (component) => component.type === ComponentType.MOUSE
    ) as PickComponentType<ComponentType.MOUSE>;

    const positionComponent = board.components.find(
      (component) => component.type === ComponentType.POSITION
    ) as PickComponentType<ComponentType.POSITION>;

    if (!mouseComponent || !positionComponent) {
      throw new Error("Critical components are missing");
    }

    return {
      ratio,
      boardMatrix,
      pentominoMatrix,
      centerShapePositionX,
      centerShapePositionY,
      mouseComponent,
      positionComponent
    };
  }

  /**
   * Проверяет, неопределены ли координаты компонентов.
   * @param data Данные для проверки.
   * @returns true если координаты не определены, иначе false.
   */
  private hasUndefinedCoordinates(data: any): boolean {
    return (
      data.mouseComponent.mx === undefined ||
      data.mouseComponent.my === undefined ||
      data.positionComponent.x === undefined ||
      data.positionComponent.y === undefined
    );
  }

  /**
   * Проверяет, выходит ли фигура за границы доски.
   * @param data Данные для проверки.
   * @returns true если фигура выходит за границы, иначе false.
   */
  private isOutOfBounds(data: any): boolean {
    const { mouseComponent, positionComponent, centerShapePositionX, centerShapePositionY, boardMatrix, cellSize, ratio } = data;
    const diff = -10 * ratio;

    return (
      mouseComponent.mx < positionComponent.x ||
      mouseComponent.my < positionComponent.y ||
      mouseComponent.mx - centerShapePositionX + diff > positionComponent.x + boardMatrix[0].length * cellSize * ratio ||
      mouseComponent.my - centerShapePositionY + diff > positionComponent.y + boardMatrix.length * cellSize * ratio ||
      mouseComponent.mx - centerShapePositionX - diff < positionComponent.x ||
      mouseComponent.my + centerShapePositionY - diff < positionComponent.y
    );
  }

  /**
   * Проверяет, пересекается ли фигура с другими фигурами на доске.
   * @param data Данные для проверки.
   * @returns true если есть пересечения, иначе false.
   */
  private intersectsOtherShapes(data: any): boolean {
    const { boardMatrix, pentominoMatrix, mouseComponent, positionComponent, centerShapePositionX, centerShapePositionY, ratio } = data;
    
    for (let i = 0; i < pentominoMatrix.length; i++) {
      for (let j = 0; j < pentominoMatrix[i].length; j++) {
        if (pentominoMatrix[i][j] !== 0) {
          const placementX = Math.round((mouseComponent.mx - centerShapePositionX - positionComponent.x) / (this.cellSize * ratio)) + j;
          const placementY = Math.round((mouseComponent.my - centerShapePositionY - positionComponent.y) / (this.cellSize * ratio)) + i;

          if (!boardMatrix[placementY] || boardMatrix[placementY][placementX] === undefined) {
            continue;  // Skip non-existing indices to avoid runtime errors
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

    if (this.hasUndefinedCoordinates(placementData)) {
      return false;
    }

    if (this.isOutOfBounds(placementData) || this.intersectsOtherShapes(placementData)) {
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
//   public getPlacementCoordinates(board: Entity, pentomino: Entity): PickComponentType<ComponentType.POSITION> | null {
//     if (this.canPlacePentomino(board, pentomino)) {
//       const data = this.preparePlacementData(board, pentomino);
//       const { mouseComponent, centerShapePositionX, centerShapePositionY, positionComponent, ratio } = data;
//       const placementX = mouseComponent.mx - centerShapePositionX + positionComponent.x;
//       const placementY = mouseComponent.my - centerShapePositionY + positionComponent.y;

//     //   return {ty x: placementX, y: placementY };
//       return {
//         type: ComponentType.POSITION,
//         x: placementX,
//         y: placementY,
//       };
//     }
//     return null;
//   }

  public getPlacementCoordinates(board: Entity, pentomino: Entity): PickComponentType<ComponentType.POSITION> | null {
    if (this.canPlacePentomino(board, pentomino)) {
      const data = this.preparePlacementData(board, pentomino);
      const { mouseComponent, centerShapePositionX, centerShapePositionY, positionComponent, ratio } = data;
      const cellX = Math.round((mouseComponent.mx - centerShapePositionX - positionComponent.x) / (this.cellSize * ratio));
      const cellY = Math.round((mouseComponent.my - centerShapePositionY - positionComponent.y) / (this.cellSize * ratio));
      // Corrected coordinate calculation
      const placementX = positionComponent.x + centerShapePositionX + cellX * this.cellSize * ratio;
      const placementY = positionComponent.y + centerShapePositionY + cellY * this.cellSize * ratio;
    //   boardPositionComponent.x +
    //   centerShapePositionX +
    //   cellX * cellSize * ratio;
      return {
        type: ComponentType.POSITION,
        x: placementX,
        y: placementY,
      };
    }
    return null;
  }
}


// Использование класса
// const game = new BoardGame(20);
// const placement = game.getPlacementCoordinates(board, pentomino);
// if (placement) {
//   console.log("Pentomino can be placed at:", placement);
// } else {
//   console.log("Pentomino cannot be placed.");
// }

export default BoardGame;

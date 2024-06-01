import { ComponentType } from "../constants/component-type.enum";
import { PickComponentType } from "../interfaces/components";
import { Entity } from "../interfaces/entity";

/**
 * Возвращает матрицу компонента типа MATRIX из сущности.
 * @param entity Сущность, матрица которой будет возвращена.
 * @returns Матрица чисел или пустой массив, если компонент не найден.
 */
function getMatrix(entity: Entity): number[] {
  const matrixComponent = entity.components.find(
    (component) => component.type === ComponentType.MATRIX
  ) as PickComponentType<ComponentType.MATRIX>;
  return matrixComponent?.matrix || [];
}

// /**
//  * Возвращает текущее соотношение компонента типа RATIO для сущности.
//  * @param entity Сущность, соотношение которой будет возвращено.
//  * @returns Соотношение или 1, если компонент не найден.
//  */
// function getCurrentRatio(entity: Entity): number {
//   const ratioComponent = entity.components.find(
//     (component) => component.type === ComponentType.RATIO
//   ) as PickComponentType<ComponentType.RATIO>;
//   return ratioComponent?.ratio || 1;
// }

// /**
//  * Проверяет, можно ли разместить пентамино на доске.
//  * @param board Доска для размещения.
//  * @param pentomino Пентамино для размещения.
//  * @param cellSize Размер ячейки доски.
//  * @returns Позицию для размещения или null, если разместить нельзя.
//  */
// export function canPlacePentomino(
//   board: Entity,
//   pentomino: Entity,
//   cellSize: number
// ): boolean {
//   // Извлекаем необходимые компоненты и матрицы
//   const ratio = getCurrentRatio(pentomino);
//   const boardMatrix = getMatrix(board);
//   const pentominoMatrix = getMatrix(pentomino);

//   const diff = -10 * ratio;

//   const centerShapePositionX =
//     (pentominoMatrix[0].length * cellSize * ratio) / 2;
//   const centerShapePositionY = (pentominoMatrix.length * cellSize * ratio) / 2;
//   const pentominoMouseComponent = pentomino.components.find(
//     (component) => component.type === ComponentType.MOUSE
//   ) as PickComponentType<ComponentType.MOUSE>;

//   const boardPositionComponent = board.components.find(
//     (component) => component.type === ComponentType.POSITION
//   ) as PickComponentType<ComponentType.POSITION>;

//   // Проверка на выход за пределы поля
//   if (
//     pentominoMouseComponent.mx === undefined ||
//     pentominoMouseComponent.my === undefined ||
//     boardPositionComponent.x === undefined ||
//     boardPositionComponent.y === undefined ||
//     pentominoMouseComponent.mx < boardPositionComponent.x ||
//     pentominoMouseComponent.my < boardPositionComponent.y ||
//     pentominoMouseComponent.mx - centerShapePositionX + diff >
//       boardPositionComponent.x + boardMatrix[0].length * cellSize * ratio ||
//     pentominoMouseComponent.my - centerShapePositionY + diff >
//       boardPositionComponent.y + boardMatrix.length * cellSize * ratio ||
//     pentominoMouseComponent.mx - centerShapePositionX - diff <
//       boardPositionComponent.x ||
//     pentominoMouseComponent.my + centerShapePositionY - diff <
//       boardPositionComponent.y
//   ) {
//     return false;
//   }

//   // Проверка на пересечение с другими фигурами на поле
//   for (let i = 0; i < pentominoMatrix.length; i++) {
//     for (let j = 0; j < pentominoMatrix[i].length; j++) {
//       if (pentominoMatrix[i][j] !== 0) {
//         const placement = calculatePlacementPosition(
//           board,
//           pentomino,
//           cellSize,
//           pentominoMouseComponent.mx,
//           pentominoMouseComponent.my
//         );
//         const cellX =
//           Math.round(
//             (placement.x - boardPositionComponent.x) / (cellSize * ratio)
//           ) + j;
//         const cellY =
//           Math.round(
//             (placement.y - boardPositionComponent.y) / (cellSize * ratio)
//           ) + i;

//         if (boardMatrix[cellY] && boardMatrix[cellY][cellX] !== 0) {
//           return false;
//         }
//       }
//     }
//   }
//   return true;
// }

// function calculatePlacementPosition(
//   board: Entity,
//   pentomino: Entity,
//   cellSize: number,
//   mouseX: number,
//   mouseY: number
// ): { x: number; y: number } {
//   const ratio = getCurrentRatio(pentomino);
//   const boardPositionComponent = board.components.find(
//     (component) => component.type === ComponentType.POSITION
//   ) as PickComponentType<ComponentType.POSITION>;
//   const pentominoMatrix = getMatrix(pentomino);
//   const centerShapePositionX =
//     (pentominoMatrix[0].length * cellSize * ratio) / 2;
//   const centerShapePositionY = (pentominoMatrix.length * cellSize * ratio) / 2;

//   const cellX = Math.round(
//     (mouseX - centerShapePositionX - boardPositionComponent.x) /
//       (cellSize * ratio)
//   );
//   const cellY = Math.round(
//     (mouseY - centerShapePositionY - boardPositionComponent.y) /
//       (cellSize * ratio)
//   );

//   return {
//     x:
//       boardPositionComponent.x +
//       centerShapePositionX +
//       cellX * cellSize * ratio,
//     y:
//       boardPositionComponent.y +
//       centerShapePositionY +
//       cellY * cellSize * ratio,
//   };
// }

// /**
//  * Размещает пентамино на доске, если это возможно.
//  * @param board Доска для размещения.
//  * @param pentomino Пентамино для размещения.
//  * @param cellSize Размер ячейки.
//  * @returns Новый объект доски с размещенным пентамино или null.
//  */
// export function placePentomino(
//   board: Entity,
//   pentomino: Entity,
//   cellSize: number
// ): Entity | null {
//   if (canPlacePentomino(board, pentomino, cellSize)) {
//     const boardMatrix = getMatrix(board);
//     const pentominoMatrix = getMatrix(pentomino);
//     const ratio = getCurrentRatio(pentomino);
//     const centerShapePositionX =
//       ((pentominoMatrix[0].length * cellSize) / 2) * ratio;
//     const centerShapePositionY =
//       ((pentominoMatrix.length * cellSize) / 2) * ratio;
//     const pentominoPositionComponent = pentomino.components.find(
//       (component) => component.type === ComponentType.MOUSE
//     ) as PickComponentType<ComponentType.MOUSE>;

//     const boardPositionComponent = board.components.find(
//       (component) => component.type === ComponentType.POSITION
//     ) as PickComponentType<ComponentType.POSITION>;

//     if (
//       !pentominoPositionComponent ||
//       pentominoPositionComponent.mx === undefined ||
//       pentominoPositionComponent.my === undefined
//     ) {
//       return null;
//     }

//     // Копируем матрицу поля
//     const newBoardMatrix = structuredClone(boardMatrix);

//     // Объединяем матрицы пентомино и поля
//     for (let i = 0; i < pentominoMatrix.length; i++) {
//       for (let j = 0; j < pentominoMatrix[i].length; j++) {
//         if (pentominoMatrix[i][j] !== 0) {
//           const cellX =
//             Math.round(
//               ((pentominoPositionComponent.mx -
//                 centerShapePositionX -
//                 boardPositionComponent.x) /
//                 cellSize) *
//                 ratio
//             ) + j;

//           const cellY =
//             Math.round(
//               ((pentominoPositionComponent.my -
//                 centerShapePositionY -
//                 boardPositionComponent.y) /
//                 cellSize) *
//                 ratio
//             ) + i;

//           newBoardMatrix[cellY][cellX] = pentominoMatrix[i][j];
//         }
//       }
//     }

//     // Возвращаем новый объект доски с обновленной матрицей
//     return {
//       ...board,
//       components: board.components.map((component) =>
//         component.type === ComponentType.MATRIX
//           ? { ...component, matrix: newBoardMatrix }
//           : component
//       ),
//     };
//   }

//   return null;
// }

// /**
//  * Проверяет, полностью ли заполнена доска пентамино.
//  * @param board Доска для проверки.
//  * @returns true, если доска полностью заполнена; иначе false.
//  */
// export function isBoardFilled(board: Entity): boolean {
//   const matrix = getMatrix(board);
//   return matrix.every((row) => row.every((cell) => cell === 1));
// }

// /**
//  * Вращает пентамино на 90 градусов по часовой стрелке.
//  * @param pentomino Пентамино для вращения.
//  * @returns Новый объект пентамино после вращения.
//  */
// export function rotatePentomino(
//   pentomino: Entity
// ): PickComponentType<ComponentType.MATRIX> {
//   const pentominoMatrix = getMatrix(pentomino);

//   // Транспонируем матрицу пентамино
//   const rotatedMatrix = pentominoMatrix[0].map((_, i) =>
//     pentominoMatrix.map((row) => row[i]).reverse()
//   );

//   return {
//     type: ComponentType.MATRIX,
//     matrix: rotatedMatrix,
//   };
// }

/**
 * Вращает пентамино на 90 градусов по часовой стрелке.
 * @param pentomino Пентамино для вращения.
 * @returns Новый объект пентамино после вращения.
 */
export function rotatePentomino(
  pentomino: Entity
): PickComponentType<ComponentType.MATRIX> {
  const pentominoMatrix = getMatrix(pentomino);
  const rows = 3; // Количество строк в pentominoMatrix
  const columns = pentominoMatrix.length / rows; // Количество столбцов в pentominoMatrix
  const rotatedMatrix = new Array(pentominoMatrix.length).fill(0);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      rotatedMatrix[j * rows + (rows - 1 - i)] =
        pentominoMatrix[i * columns + j];
    }
  }

  return {
    type: ComponentType.MATRIX,
    rows: 3,
    matrix: rotatedMatrix,
  };
}

// /**
//  * Создает зеркальное отображение пентамино.
//  * @param pentomino Пентамино для зеркального отображения.
//  * @returns Новый объект пентамино после зеркального отображения.
//  */
// export function mirrorPentomino(pentomino: Entity): Entity {
//   const pentominoMatrix = getMatrix(pentomino);

//   // Зеркально отображаем матрицу пентамино
//   const mirroredMatrix = pentominoMatrix.map((row) => row.reverse());

//   return {
//     ...pentomino,
//     components: pentomino.components.map((component) =>
//       component.type === ComponentType.MATRIX
//         ? { ...component, matrix: mirroredMatrix }
//         : component
//     ),
//   };
// }

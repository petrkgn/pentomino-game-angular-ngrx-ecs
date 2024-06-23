import { ComponentType } from "../constants/component-type.enum";
import { PickComponentType } from "../types/components";
import { Entity } from "../types/entity";

/**
 * Возвращает матрицу компонента типа MATRIX из сущности.
 * @param entity Сущность, матрица которой будет возвращена.
 * @returns Матрица чисел или пустой массив, если компонент не найден.
 */
function getMatrix(entity: Entity): number[] {
  const matrixComponent = entity.components.entities[
    ComponentType.MATRIX
  ] as PickComponentType<ComponentType.MATRIX>;
  return matrixComponent?.matrix || [];
}

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

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
/**
 * Возвращает количество строк в матрице компонента типа MATRIX из сущности.
 * @param {Entity} entity - Сущность, количество строк матрицы которой будет возвращено.
 * @returns {number} Количество строк в матрице компонента или 1, если компонент не найден.
 */
function getRows(entity: Entity): number {
  const matrixComponent = entity.components.entities[
    ComponentType.MATRIX
  ] as PickComponentType<ComponentType.MATRIX>;
  return matrixComponent?.rows || 1;
}

/**
 * Вращает пентамино на 90 градусов по часовой стрелке.
 * @param pentomino Пентамино для вращения.
 * @returns Новый объект пентамино после вращения.
 */
export function rotatePentomino(
  pentomino: Entity
): PickComponentType<ComponentType.MATRIX> {
  const pentominoMatrix = getMatrix(pentomino);
  const rows = getRows(pentomino); // Количество строк в pentominoMatrix
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
    rows: rows,
    matrix: rotatedMatrix,
  };
}

/**
 * Зеркально отображает пентомино по вертикальной оси.
 * @param pentomino Пентомино для отображения.
 * @returns Новый объект пентомино после зеркального отображения.
 */
export function mirrorPentomino(
  pentomino: Entity
): PickComponentType<ComponentType.MATRIX> {
  const pentominoMatrix = getMatrix(pentomino);
  const rows = getRows(pentomino); // Количество строк в pentominoMatrix
  const columns = pentominoMatrix.length / rows; // Количество столбцов в pentominoMatrix
  const mirroredMatrix = new Array(pentominoMatrix.length).fill(0);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      mirroredMatrix[i * columns + (columns - 1 - j)] =
        pentominoMatrix[i * columns + j];
    }
  }

  return {
    type: ComponentType.MATRIX,
    rows: rows,
    matrix: mirroredMatrix,
  };
}

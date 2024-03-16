import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameService {
  cellSize = 32;
  matrixStartPosition = {
    x: 100,
    y: 100,
  };

  constructor() {}

  findMatrixElement(
    matrix: number[][],
    mouseX: number,
    mouseY: number
  ): [number, number] | false {
    const cellX = Math.floor(
      (mouseX - this.matrixStartPosition.x) / this.cellSize
    );
    const cellY = Math.floor(
      (mouseY - this.matrixStartPosition.y) / this.cellSize
    );

    if (
      cellX >= 0 &&
      cellY >= 0 &&
      cellX < matrix[0].length &&
      cellY < matrix.length
    ) {
      return [cellY, cellX];
    } else {
      return false;
    }
  }
}

// // Пример использования:
// const mouseX = mousePosition.mx;
// const mouseY = mousePosition.my;
// const result = findMatrixElement(mouseX, mouseY);

// if (result !== false) {
//   console.log(`Координаты мыши принадлежат элементу матрицы: [${result[0]}, ${result[1]}]`);
// } else {
//   console.log(`Координаты мыши выходят за пределы матрицы`);
// }

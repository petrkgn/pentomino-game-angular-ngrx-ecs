export const Boards = {
  ["5x5"]: createZeroFilledArray(25),
  ["5x6"]: createZeroFilledArray(30),
};

function createZeroFilledArray(size: number): number[] {
  return Array(size).fill(0);
}

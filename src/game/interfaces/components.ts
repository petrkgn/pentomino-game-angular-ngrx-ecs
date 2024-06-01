import { ComponentType } from "../constants/component-type.enum";

interface PositionComponent {
  type: ComponentType.POSITION;
  x: number;
  y: number;
}

interface MouseComponent {
  type: ComponentType.MOUSE;
  mx: number;
  my: number;
}

interface RenderComponent {
  type: ComponentType.RENDER;
  color: string;
}

interface RotateComponent {
  type: ComponentType.ROTATE;
  angle: number;
}

interface IsActiveTag {
  type: ComponentType.IS_ACTIVE_TAG;
}

interface MatrixComponent {
  type: ComponentType.MATRIX;
  rows: number;
  matrix: number[];
}

interface PlacementComponent {
  type: ComponentType.PLACEMENT;
  cellX: number;
  cellY: number;
}

interface Ratio {
  type: ComponentType.RATIO;
  ratio: number;
}

export type EntityComponents =
  | PositionComponent
  | RenderComponent
  | MouseComponent
  | RotateComponent
  | IsActiveTag
  | MatrixComponent
  | PlacementComponent
  | Ratio;

type FilterUnionType<T, U> = T extends { type: U } ? T : never;

export type PickComponentType<T extends ComponentType> = NonNullable<
  FilterUnionType<EntityComponents, T>
>;

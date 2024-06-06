import { ComponentType } from "../constants/component-type.enum";
import { GameObjectsIds } from "../constants/game-objects-ids.enum";

type PositionComponent = {
  type: ComponentType.POSITION;
  x: number;
  y: number;
};

type MouseComponent = {
  type: ComponentType.MOUSE;
  mx: number;
  my: number;
};

type RenderComponent = {
  type: ComponentType.RENDER;
  color: string;
};

type RotateComponent = {
  type: ComponentType.ROTATE;
  angle: number;
};

type IsActiveTag = {
  type: ComponentType.IS_ACTIVE_TAG;
};

type MatrixComponent = {
  type: ComponentType.MATRIX;
  rows: number;
  matrix: number[];
};

type PlacementComponent = {
  type: ComponentType.PLACEMENT;
  cellX: number;
  cellY: number;
};

type Ratio = {
  type: ComponentType.RATIO;
  ratio: number;
};

type view = {
  type: ComponentType.VIEW;
  view: GameObjectsIds;
};

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

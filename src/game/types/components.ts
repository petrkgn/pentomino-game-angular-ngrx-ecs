import { ComponentType } from "../constants/component-type.enum";
import { GameObjectsIds } from "../constants/game-objects-ids.enum";
import { EntityView } from "../constants/view.enum";

type Position = {
  type: ComponentType.POSITION;
  x: number;
  y: number;
};

type Mouse = {
  type: ComponentType.MOUSE;
  mx: number;
  my: number;
};

type Render = {
  type: ComponentType.RENDER;
  color: string;
};

type Rotate = {
  type: ComponentType.ROTATE;
  angle: number;
};

type IsActiveTag = {
  type: ComponentType.IS_ACTIVE_TAG;
};

type Matrix = {
  type: ComponentType.MATRIX;
  rows: number;
  matrix: number[];
};

type Placement = {
  type: ComponentType.PLACEMENT;
  cellX: number;
  cellY: number;
};

type Ratio = {
  type: ComponentType.RATIO;
  ratio: number;
};

type View = {
  type: ComponentType.VIEW;
  img: EntityView | null;
};

type IsPackTag = {
  type: ComponentType.IS_PACK_TAG;
};

type Size = {
  type: ComponentType.SIZE;
  width: number;
  height: number;
};

type HintBox = {
  type: ComponentType.HINT_BOX;
  x: number;
  y: number;
  width: number;
  height: number;
};

type IsMirrorTag = {
  type: ComponentType.IS_MIRROR_TAG;
};

export type EntityComponents =
  | Position
  | Render
  | Mouse
  | Rotate
  | IsActiveTag
  | Matrix
  | Placement
  | Ratio
  | View
  | IsPackTag
  | Size
  | HintBox
  | IsMirrorTag;

type FilterUnionType<T, U> = T extends { type: U } ? T : never;

export type PickComponentType<T extends ComponentType> = NonNullable<
  FilterUnionType<EntityComponents, T>
>;

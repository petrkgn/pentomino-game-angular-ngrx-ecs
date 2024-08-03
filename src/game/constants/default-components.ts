import { EntityComponents } from "../types/components";
import { ComponentType } from "./component-type.enum";

export const DefaultComponents: {
  [key in ComponentType]?: Partial<EntityComponents>;
} = {
  [ComponentType.POSITION]: { type: ComponentType.POSITION, x: 0, y: 0 },
  [ComponentType.ROTATE]: { type: ComponentType.ROTATE, angle: 0 },
  [ComponentType.RATIO]: { type: ComponentType.RATIO, ratio: 1 },
  [ComponentType.IS_PACK_TAG]: { type: ComponentType.IS_PACK_TAG },
  [ComponentType.HINT_BOX]: {
    type: ComponentType.HINT_BOX,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  [ComponentType.VIEW]: {
    type: ComponentType.VIEW,
    img: null,
  },
  [ComponentType.MATRIX]: {
    type: ComponentType.MATRIX,
    rows: 0,
    matrix: [],
  },
};

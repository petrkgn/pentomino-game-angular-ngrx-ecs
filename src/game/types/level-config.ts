import { ComponentType } from "../constants/component-type.enum";
import { GameObjectsIds } from "../constants/game-objects-ids.enum";
import { EntityComponents } from "./components";

export interface Board {
  size: string;
  components: string[];
}

export interface Shape {
  id: string;
  components: string[];
}

export type LevelConfig = {
  board: Board;
  shapes: Shape[];
};

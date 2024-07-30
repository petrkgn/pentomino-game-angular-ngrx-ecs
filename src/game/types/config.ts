import { ComponentType } from "../constants/component-type.enum";
import { GameObjectsIds } from "../constants/game-objects-ids.enum";
import { EntityComponents } from "./components";

interface Board {
  size: string;
  components: string[];
}

interface Shape {
  id: string;
  components: string[];
}

export type LevelConfig = {
  board: Board;
  shapes: Shape[];
};

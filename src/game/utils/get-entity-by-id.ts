import { GameObjectsIds } from "../constants/game-objects-ids.enum";
import { Entity } from "../interfaces/entity";
import { GameObjects, entitiesAdapter } from "../store/game/initial.state";

export function getEntitiesById(id: GameObjectsIds, state: GameObjects): Entity[]  {
    return entitiesAdapter
      .getSelectors()
      .selectAll(state)
      .filter(entity => entity.id === id)
  }
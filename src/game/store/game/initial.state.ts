import { createEntityAdapter, EntityState } from "@ngrx/entity";
import { Entity } from "../../interfaces/entity";

export interface GameObjects extends EntityState<Entity> {}

export const entitiesAdapter = createEntityAdapter<Entity>({
  selectId: (entity) => entity.id,
  sortComparer: false,
});

export const initialGameEntitiesState: GameObjects =
  entitiesAdapter.getInitialState({});

import { createEntityAdapter, EntityState } from "@ngrx/entity";
import { Entity } from "../../types/entity";
import { EntityComponents } from "../../types/components";

export interface GameObjects extends EntityState<Entity> {}

export const entitiesAdapter = createEntityAdapter<Entity>({
  selectId: (entity) => entity.id,
  sortComparer: false,
});

export const componentsAdapter = createEntityAdapter<EntityComponents>({
  selectId: (entity) => entity.type,
});

export const initialGameEntitiesState: GameObjects =
  entitiesAdapter.getInitialState();

import { createFeature, createSelector } from "@ngrx/store";

import { Entity } from "../../types/entity";
import { ComponentType } from "../../constants/component-type.enum";
import { GameObjectsIds } from "../../constants/game-objects-ids.enum";
import { gameReducer } from "./reducer";
import EntitiesManager from "../../utils/entitiesManager";
import ComponentsManager from "../../utils/componentsManager";
import { entitiesAdapter, componentsAdapter } from "./initial.state";

const entitiesManager = new EntitiesManager(entitiesAdapter);
const componentsManager = new ComponentsManager(
  entitiesAdapter,
  componentsAdapter
);

export const gameFeature = createFeature({
  name: "Game",
  reducer: gameReducer,
  extraSelectors: ({ selectGameState, selectEntities }) => ({
    ...entitiesAdapter.getSelectors(selectGameState),
    selectActiveShape: createSelector(selectGameState, (state): Entity[] => {
      const includeComponents = [ComponentType.IS_ACTIVE_TAG];

      return componentsManager.getEntitiesWithComponents({
        state,
        includeComponents,
      });
    }),
    selectBoard: createSelector(selectGameState, (state) =>
      entitiesManager.getEntity({ state, entityId: GameObjectsIds.BOARD })
    ),
    selectShapesPack: createSelector(selectGameState, (state): Entity[] => {
      const includeComponents = [ComponentType.IS_PACK_TAG];
      return componentsManager.getEntitiesWithComponents({
        state,
        includeComponents,
      });
    }),
    selectPlacementShapes: createSelector(
      selectGameState,
      (state): Entity[] => {
        const includeComponents = [ComponentType.PLACEMENT];

        return componentsManager.getEntitiesWithComponents({
          state,
          includeComponents,
        });
      }
    ),
    selectAll: createSelector(selectEntities, (entities) => {
      return Object.values(entities);
    }),
  }),
});

import { createFeature, createReducer, createSelector, on } from "@ngrx/store";

import { Entity } from "../../types/entity";
import { ComponentType } from "../../constants/component-type.enum";
import { PlayerActions, GameActions, PentominoActions } from "./actions";
import {
  initialGameEntitiesState,
  entitiesAdapter,
  componentsAdapter,
} from "./initial.state";
import { GameObjectsIds } from "../../constants/game-objects-ids.enum";
import * as utils from "../../utils";
import { gameReducer } from "./reducer";
import EntitiesManager from "../../utils/entitiesManager";
import ComponentsManager from "../../utils/componentsManager";
import { EntityState } from "@ngrx/entity";

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
  }),
});

import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { Entity } from '../../interfaces/entity';
import { ComponentType } from '../../constants/component-type.enum';
import { PlayerActions, GameActions, PentominoActions } from './actions';
import { initialGameEntitiesState, entitiesAdapter } from './initial.state';
import { GameObjectsIds } from '../../constants/game-objects-ids.enum';
import * as utils from '../../utils';
import { gameReducer } from './reducer';

export const gameFeature = createFeature({
  name: 'Game',
  reducer: gameReducer,
  extraSelectors: ({ selectGameState, selectEntities }) => ({
    ...entitiesAdapter.getSelectors(selectGameState),
    selectActiveShape: createSelector(selectEntities, (entities): Entity[] => {
      const includedComponents = [ComponentType.IS_ACTIVE_TAG];

      return utils.selectEntitiesWithFilteredComponents(
        entities,
        includedComponents
      );
    }),
    selectBoard: createSelector(selectGameState, (state) =>
      utils.getEntitiesById(GameObjectsIds.BOARD, state)
    ),
    selectPlacementShapes: createSelector(
      selectEntities,
      (entities): Entity[] => {
        const includedComponents = [ComponentType.PLACEMENT];

        return utils.selectEntitiesWithFilteredComponents(
          entities,
          includedComponents
        );
      }
    ),
  }),
});

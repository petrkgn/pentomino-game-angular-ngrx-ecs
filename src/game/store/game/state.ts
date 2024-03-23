import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { Entity } from '../../interfaces/entity';
import { ComponentType } from '../../constants/component-type.enum';
import { PlayerActions, GameActions } from './actions';
import { initialGameEntitiesState, entitiesAdapter } from './initial.state';
import { GameObjectsIds } from '../../constants/game-objects-ids.enum';
import { canPlacePentomino } from '../../utils/matricies-utils.old';
import { CELL_SIZE } from '../../constants/cell-size';
import * as  utils from '../../utils';


const gameReducer =  createReducer(
    initialGameEntitiesState,
    on(PlayerActions.rotateShape, (state, { angle }) => {
      const includedComponents: ComponentType[] = [ComponentType.ROTATE];
      const excludedComponents: ComponentType[] = [];
      const updates = utils.updateEntitiesWithComponents(
        state,
        includedComponents,
        excludedComponents,
        ComponentType.ROTATE,
        { angle }
      );

      return entitiesAdapter.updateMany(updates, state);
    }),  
    on(PlayerActions.mouseMove, (state, { mx, my }) => {
      const includedComponents: ComponentType[] = [
        ComponentType.MOUSE,
        ComponentType.IS_ACTIVE_TAG,
      ];
      const excludedComponents: ComponentType[] = [];

      const updates = utils.updateEntitiesWithComponents(
        state,
        includedComponents,
        excludedComponents,
        ComponentType.MOUSE,
        { mx, my }
      );

      return entitiesAdapter.updateMany(updates, state);
    }),
    on(GameActions.shapePlacement, (state) => {
      const board = utils.getEntitiesById(GameObjectsIds.BOARD, state)[0]
      const includedComponents = [ComponentType.IS_ACTIVE_TAG];
      const excludedComponents: ComponentType[] = [];
      const entities = state.entities;
      const activeShape = utils.selectEntitiesWithFilteredComponents(    
        includedComponents,
        excludedComponents,
        entities,
      )[0];     

      if (!board || !activeShape) {
        return { ...state };
      }
   
      const placementPosition = canPlacePentomino(
        board,
        activeShape,
        CELL_SIZE
      );

      if (!placementPosition) {
        return { ...state };
      }

      const updatedComponents = utils.updateActiveEntityWhenPlacement(
        activeShape,
        placementPosition
      );      

      return entitiesAdapter.updateOne(
        {
          id: activeShape.id,
          changes: { components: updatedComponents  },
        },
        state
      );
    }),
    on(GameActions.ratioChanged, (state, { ratio }) => {
      const includedComponents: ComponentType[] = [ComponentType.RATIO];
      const excludedComponents: ComponentType[] = [];
  
      const updates = utils.updateEntitiesWithComponents(
        state,
        includedComponents,
        excludedComponents,
        ComponentType.RATIO,
        { ratio }
      );

      return entitiesAdapter.updateMany(updates, state);
    })
  )

export const gameFeature = createFeature({
    name: 'Game',
    reducer: gameReducer,
    extraSelectors: ({ selectGameState, selectEntities }) => ({
      ...entitiesAdapter.getSelectors(selectGameState),
      selectActiveShape: createSelector(
        selectEntities, 
        (entities): Entity[] => {
      const includedComponents = [ComponentType.IS_ACTIVE_TAG];
      const excludedComponents: ComponentType[] = [];
    
      return utils.selectEntitiesWithFilteredComponents(
        includedComponents,
        excludedComponents,
        entities
      )
    }),
      selectBoard: createSelector(
        selectGameState, 
        (state) => utils.getEntitiesById(GameObjectsIds.BOARD, state)
      ),
    }),
  })

  


import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { Entity } from '../../interfaces/entity';
import { ComponentType } from '../../constants/component-type.enum';
import { PlayerActions, GameActions, PentominoActions } from './actions';
import { initialGameEntitiesState, entitiesAdapter } from './initial.state';
import { GameObjectsIds } from '../../constants/game-objects-ids.enum';
import { canPlacePentomino } from '../../utils/matricies-utils.old';
import { CELL_SIZE } from '../../constants/cell-size';
import * as utils from '../../utils';
import { EntityComponents } from '../../interfaces/components';
import BoardGame from '../../utils/board';

const gameReducer = createReducer(
  initialGameEntitiesState,
  on(PentominoActions.addEntity, (state, { entity }) => {
    return entitiesAdapter.addOne(entity, state);
  }),
  on(PentominoActions.updateEntity, (state, { id, changes }) => {
    return entitiesAdapter.updateOne({ id, changes }, state);
  }),
  on(PentominoActions.deleteEntity, (state, { id }) => {
    return entitiesAdapter.removeOne(id, state);
  }),
  on(
    PentominoActions.addComponentToEntity,
    (state, { entityId, component }) => {
      const currentPentomino = state.entities[entityId];
      if (!currentPentomino) return state;

      return entitiesAdapter.updateOne(
        {
          id: entityId,
          changes: {
            components: [...currentPentomino.components, component],
          },
        },
        state
      );
    }
  ),
  on(
    PentominoActions.removeComponentFromEntity,
    (state, { entityId, currentComponent }) => {
      const currentPentomino = state.entities[entityId];
      if (!currentPentomino) return state;
      const updatedEntity = entitiesAdapter.updateOne(
        {
          id: entityId,
          changes: {
            components: currentPentomino.components.filter(
              (component) => component['type'] !== currentComponent
            ),
          },
        },
        state
      );
      return updatedEntity;
    }
  ),
  on(
    PentominoActions.updateComponentData,
    (state, { entityId, currentComponent, changes }) => {
      if (
        entityId === undefined ||
        currentComponent === undefined ||
        changes === undefined
      ) {
        return state; // Возвращаем исходное состояние, если не указаны все необходимые параметры
      }
      // console.log(entityId, currentComponent, changes);
      const updatedPentominosState = entitiesAdapter.updateOne(
        {
          id: entityId,
          changes: {
            components: (state.entities[entityId]?.components || []).map(
              (component) => {
                if (component.type === currentComponent) {
                  return { ...component, ...changes } as EntityComponents;
                }
                return component as EntityComponents;
              }
            ),
          },
        },
        state
      );
      return updatedPentominosState;
    }
  ),
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
    const board = utils.getEntitiesById(GameObjectsIds.BOARD, state)[0];
    const includedComponents = [ComponentType.IS_ACTIVE_TAG];

    const entities = state.entities;
    const activeShape = utils.selectEntitiesWithFilteredComponents(
      entities,
      includedComponents
    )[0];

    if (!board || !activeShape) {
      return { ...state };
    }
    const boardGame = new BoardGame(32);
    const placementPosition = boardGame.getPlacementCoordinates(
      board,
      activeShape
    );

    if (!placementPosition) {
      return { ...state };
    }

    const updatedComponents = utils.updateActiveEntityWhenPlacement(
      activeShape,
      placementPosition
    );
    console.log(updatedComponents);
    return entitiesAdapter.updateOne(
      {
        id: activeShape.id,
        changes: { components: updatedComponents },
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
);

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
        const includedComponents = [ComponentType.IS_PLACEMENT_TAG];

        return utils.selectEntitiesWithFilteredComponents(
          entities,
          includedComponents
        );
      }
    ),
  }),
});

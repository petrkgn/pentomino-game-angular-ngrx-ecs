import { createFeature, createReducer, on } from '@ngrx/store';

import { Entity } from '../../interfaces/entity';
import {
  EntityComponents,
  PickComponentType,
} from '../../interfaces/components';
import { ComponentType } from '../../constants/component-type.enum';
import { PentominoActions, PlayerActions, GameActions } from './game.actions';
import { updateEntitiesWithComponents } from '../../utils/updates-entities';
import {
  allEntities,
  selectEntitiesWithFilteredComponents,
} from './game.selectors';
import { initialGameEntitiesState, entitiesAdapter } from './initial.state';
import { getEntitiesWithComponents } from '../../utils/filtered-entities';
import { entitiesMapper } from '../../utils/entities-mapper';
import { GameObjectsIds } from '../../constants/game-objects-ids.enum';
import {
  canPlacePentomino,
  placePentomino,
} from '../../utils/matricies-utils.old';
import { PentominoService } from '../../services/pentomino.service';

export const GameFeature = createFeature({
  name: 'Game',
  reducer: createReducer(
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
    on(PlayerActions.keyDown, (state, { angle }) => {
      const includedComponents: ComponentType[] = [ComponentType.ROTATE];
      const excludedComponents: ComponentType[] = [];
      const updates = updateEntitiesWithComponents(
        state,
        includedComponents,
        excludedComponents,
        ComponentType.ROTATE,
        { angle }
      );

      return entitiesAdapter.updateMany(updates, state);
    }),
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
    on(PlayerActions.mouseMove, (state, { mx, my }) => {
      const includedComponents: ComponentType[] = [
        ComponentType.MOUSE,
        ComponentType.IS_ACTIVE_TAG,
      ];
      const excludedComponents: ComponentType[] = [];

      const updates = updateEntitiesWithComponents(
        state,
        includedComponents,
        excludedComponents,
        ComponentType.MOUSE,
        { mx, my }
      );

      return entitiesAdapter.updateMany(updates, state);
    }),
    on(GameActions.shapePlacement, (state) => {
      const includedComponents = [ComponentType.IS_ACTIVE_TAG];
      const excludedComponents: ComponentType[] = [];
      const entities = entitiesAdapter.getSelectors().selectAll(state);
      const board = entities.find(
        (entity) => entity.id === GameObjectsIds.BOARD
      );
      const filteredEntities = getEntitiesWithComponents(
        entities,
        includedComponents,
        excludedComponents
      );

      if (!board || filteredEntities.length === 0) {
        return { ...state };
      }

      const cloneBoard = structuredClone(board);
      const clonePentomino = structuredClone(filteredEntities[0]);
      const service = new PentominoService();
      const canPlacement = canPlacePentomino(
        board,
        filteredEntities[0],
        PLACE_PENTOMINO_SIZE
      );

      if (!canPlacement) {
        return { ...state };
      }

      const updatedComponents = updateEntityComponents(
        filteredEntities[0],
        canPlacement
      );

      return entitiesAdapter.updateOne(
        {
          id: filteredEntities[0].id,
          changes: { components: updatedComponents },
        },
        state
      );
    }),
    on(GameActions.ratioChanged, (state, { ratio }) => {
      const includedComponents: ComponentType[] = [ComponentType.RATIO];
      const excludedComponents: ComponentType[] = [];
      const clonedState = structuredClone(state);
      const updates = updateEntitiesWithComponents(
        clonedState,
        includedComponents,
        excludedComponents,
        ComponentType.RATIO,
        { ratio }
      );

      return entitiesAdapter.updateMany(updates, state);
    })
  ),
});

export const { selectAll } = entitiesAdapter.getSelectors(
  GameFeature.selectGameState
);

function updateEntityComponents(
  currentPentomino: Entity,
  canPlacement: PickComponentType<ComponentType.POSITION>
) {
  return currentPentomino.components
    .filter((component) => component.type !== ComponentType.IS_ACTIVE_TAG)
    .map((component) =>
      component.type === ComponentType.POSITION
        ? { ...component, ...canPlacement }
        : component
    )
    .concat({ type: ComponentType.IS_PLACEMENT_TAG });
}

const PLACE_PENTOMINO_SIZE = 32;

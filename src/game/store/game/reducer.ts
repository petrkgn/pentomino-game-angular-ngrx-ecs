import { createReducer, on } from "@ngrx/store";

import {
  EntityComponents,
  PickComponentType,
} from "../../interfaces/components";
import { ComponentType } from "../../constants/component-type.enum";
import { PentominoActions, PlayerActions, GameActions } from "./actions";

import { initialGameEntitiesState, entitiesAdapter } from "./initial.state";

import { GameObjectsIds } from "../../constants/game-objects-ids.enum";
import * as utils from "../../utils";
import BoardGame from "../../utils/board";

const boardGame = new BoardGame();

export const gameReducer = createReducer(
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
              (component) => component["type"] !== currentComponent
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
        return state;
      }

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
    // Определяем компоненты, которые должны присутствовать и отсутствовать
    const includedComponents: ComponentType[] = [
      ComponentType.IS_ACTIVE_TAG,
      ComponentType.ROTATE,
      ComponentType.MATRIX,
    ];
    const excludedComponents: ComponentType[] = [];

    // Извлекаем активную форму, соответствующую фильтру компонентов
    const entities = state.entities;
    const activeShape = utils.selectEntitiesWithFilteredComponents(
      entities,
      includedComponents
    )[0];

    // Поворачиваем матрицу активной формы
    const rotatedMatrix = utils.rotatePentomino(activeShape);

    // Обновляем компоненты для активной формы
    const updatedComponents = {
      [ComponentType.ROTATE]: { angle },
      [ComponentType.MATRIX]: rotatedMatrix,
    };

    // Получаем обновления для сущностей
    const updates = utils.updateEntitiesWithComponents(
      state,
      includedComponents,
      excludedComponents,
      updatedComponents
    );

    // Возвращаем обновленное состояние с примененными изменениями
    return entitiesAdapter.updateMany(updates, state);
  }),
  on(PlayerActions.mouseMove, (state, { mx, my }) => {
    const includedComponents: ComponentType[] = [
      ComponentType.MOUSE,
      ComponentType.IS_ACTIVE_TAG,
    ];
    const excludedComponents: ComponentType[] = [];
    const updatedMousePosition = {
      [ComponentType.MOUSE]: {
        mx,
        my,
      } as PickComponentType<ComponentType.MOUSE>,
    };
    const updates = utils.updateEntitiesWithComponents(
      state,
      includedComponents,
      excludedComponents,
      updatedMousePosition
    );

    return entitiesAdapter.updateMany(updates, state);
  }),
  on(GameActions.shapePlacement, (state) => {
    // Получаем игровую доску по её идентификатору
    const board = utils.getEntitiesById(GameObjectsIds.BOARD, state)[0];

    // Устанавливаем компоненты, которые должны присутствовать у активной формы
    const includedComponents = [ComponentType.IS_ACTIVE_TAG];

    // Извлекаем активную форму с указанными компонентами
    const entities = state.entities;
    const activeShape = utils.selectEntitiesWithFilteredComponents(
      entities,
      includedComponents
    )[0];

    // Проверяем наличие доски и активной формы
    if (!board || !activeShape) {
      return { ...state };
    }

    // Определяем позицию для размещения активной формы на доске
    const startTime = performance.now();
    const placementPosition = boardGame.getPlacementPosition(
      board,
      activeShape
    );
    const elapsedTime = performance.now() - startTime;
    console.log(`Placement time: ${elapsedTime.toFixed(2)} ms`);
    // Пересчитываем координаты формы с учетом новой позиции
    const updatedShapeCoords = boardGame.recalculateShapePosition(
      board,
      activeShape,
      placementPosition
    );

    // Проверяем наличие позиции для размещения и пересчитанных координат
    if (!placementPosition || !updatedShapeCoords) {
      return { ...state };
    }

    // Обновляем компоненты активной формы с новыми координатами и позицией
    const updatedComponents = utils.updateActiveEntityWhenPlacement(
      activeShape,
      updatedShapeCoords,
      placementPosition
    );

    // Возвращаем обновленное состояние с примененными изменениями
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

    const updatedRatio = {
      [ComponentType.RATIO]: {
        ratio,
      } as PickComponentType<ComponentType.RATIO>,
    };

    const updates = utils.updateEntitiesWithComponents(
      state,
      includedComponents,
      excludedComponents,
      updatedRatio
    );

    return entitiesAdapter.updateMany(updates, state);
  }),
  on(GameActions.ratioChanged, (state) => {
    const board = utils.getEntitiesById(GameObjectsIds.BOARD, state)[0];
    const includedComponents = [ComponentType.PLACEMENT];

    const entities = state.entities;
    const activeShape = utils.selectEntitiesWithFilteredComponents(
      entities,
      includedComponents
    )[0];

    if (!board || !activeShape) {
      return { ...state };
    }

    const startTime = performance.now();
    const placementPosition = boardGame.recalculateShapePosition(
      board,
      activeShape
    );
    const elapsedTime = performance.now() - startTime;
    console.log(`Recalculation time: ${elapsedTime.toFixed(2)} ms`);

    if (!placementPosition) {
      return { ...state };
    }

    const updatedComponents = utils.updateComponentInEntity(
      activeShape,
      ComponentType.POSITION,
      placementPosition
    );

    return entitiesAdapter.updateOne(
      {
        id: activeShape.id,
        changes: { components: updatedComponents },
      },
      state
    );
  })
);

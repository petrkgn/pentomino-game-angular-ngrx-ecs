import { createReducer, on } from "@ngrx/store";

import { EntityComponents, PickComponentType } from "../../types/components";
import { ComponentType } from "../../constants/component-type.enum";
import { PentominoActions, PlayerActions, GameActions } from "./actions";

import {
  initialGameEntitiesState,
  entitiesAdapter,
  componentsAdapter,
  GameObjects,
} from "./initial.state";

import { GameObjectsIds } from "../../constants/game-objects-ids.enum";
import * as utils from "../../utils";
import BoardGame from "../../utils/board";
import { EntityId } from "../../types/entity-id.type";
import { Entity } from "../../types/entity";
import ComponentsManager from "../../utils/componentsManager";
import EntitiesManager from "../../utils/entitiesManager";
import { EntityState } from "@ngrx/entity";

const boardGame = new BoardGame();
const entitiesManager = new EntitiesManager(entitiesAdapter);
const componentsManager = new ComponentsManager(
  entitiesAdapter,
  componentsAdapter
);

export const gameReducer = createReducer(
  initialGameEntitiesState,
  on(PentominoActions.addEntity, (state, { entityId, components }) => {
    state = entitiesManager.createEntity({
      state,
      entityId,
      components,
    });

    return state;
  }),
  // on(PentominoActions.updateEntity, (state, { id, changes }) => {
  //   return entitiesAdapter.updateOne({ id, changes }, state);
  // }),
  // on(PentominoActions.deleteEntity, (state, { id }) => {
  //   return entitiesAdapter.removeOne(id, state);
  // }),
  on(
    PentominoActions.addComponentToEntity,
    (state, { entityId, component }) => {
      return componentsManager.addComponentToEntity({
        state,
        entityId,
        component,
      });
    }
  ),
  // on(
  //   PentominoActions.removeComponentFromEntity,
  //   (state, { entityId, currentComponent }) => {
  //     const currentPentomino = state.entities[entityId];
  //     const componentsState = currentPentomino?.components;
  //     if (!currentPentomino || !componentsState) return state;
  //     const updatedEntity = entitiesAdapter.updateOne(
  //       {
  //         id: entityId,
  //         changes: {
  //           components: componentsAdapter.removeOne(
  //             currentComponent,
  //             componentsState
  //           ),
  //         },
  //       },
  //       state
  //     );
  //     return updatedEntity;
  //   }
  // ),
  on(
    PentominoActions.updateComponentData,
    (state, { entityId, componentType, changes }) => {
      if (entityId === undefined || componentType === undefined || !changes) {
        return state;
      }

      return componentsManager.updateComponentData({
        state,
        entityId,
        componentType,
        changes,
      });
    }
  ),
  on(PlayerActions.rotateShape, (state, { angle }) => {
    const includeComponents: ComponentType[] = [ComponentType.IS_ACTIVE_TAG];

    const activeShape = componentsManager.getEntitiesWithComponents({
      state,
      includeComponents,
    })[0];

    if (!activeShape) return state;

    const rotatedMatrix = utils.rotatePentomino(activeShape);

    const updatedComponents = [
      { componentType: ComponentType.ROTATE, changes: { angle } },
      { componentType: ComponentType.MATRIX, changes: rotatedMatrix },
    ];

    return componentsManager.updateMultipleComponentsDataForEntities(
      { state, includeComponents },
      updatedComponents
    );
  }),

  on(PlayerActions.chooseShape, (state, { mx, my }) => {
    const includeComponents: ComponentType[] = [ComponentType.HINT_BOX];

    const shapes = componentsManager.getEntitiesWithComponents({
      state,
      includeComponents,
    });

    const board = entitiesManager.getEntity({
      state,
      entityId: GameObjectsIds.BOARD,
    });

    const shapesId = findEntityWithPoint(state, { x: mx, y: my });

    if (!shapesId && !board) return state;
    let newState = state;

    // Берем фигуру с доски
    if (board) {
      const cellValue = boardGame.getCellValueAtMousePosition(mx, my, board);

      if (cellValue) {
        const newBoard = boardGame.replaceCellValue(board, cellValue);
        newState = componentsManager.removeComponentFromEntity({
          state: newState,
          entityId: cellValue,
          componentType: ComponentType.IS_PACK_TAG,
        });

        newState = componentsManager.addComponentToEntity({
          state: newState,
          entityId: cellValue,
          component: { type: ComponentType.IS_ACTIVE_TAG },
        });

        newState = componentsManager.updateComponentData({
          state: newState,
          entityId: cellValue,
          componentType: ComponentType.POSITION,
          changes: { x: mx, y: my },
        });

        newState = componentsManager.updateComponentData({
          state: newState,
          entityId: GameObjectsIds.BOARD,
          componentType: ComponentType.MATRIX,
          changes: { matrix: newBoard },
        });
      }
    }
    // Берем фигуру из доступных вне доски
    if (shapesId) {
      newState = componentsManager.removeComponentForEntities({
        state,
        includeComponents,
        componentType: ComponentType.IS_PACK_TAG,
      });

      newState = componentsManager.addComponentToEntity({
        state: newState,
        entityId: shapesId,
        component: { type: ComponentType.IS_ACTIVE_TAG },
      });

      newState = componentsManager.updateComponentData({
        state: newState,
        entityId: shapesId,
        componentType: ComponentType.POSITION,
        changes: { x: mx, y: my },
      });
    }
    return newState;
  }),
  on(PlayerActions.mouseMove, (state, { mx, my }) => {
    const includeComponents: ComponentType[] = [ComponentType.IS_ACTIVE_TAG];

    return componentsManager.updateComponentDataForEntities({
      state,
      includeComponents,
      componentType: ComponentType.POSITION,
      changes: { x: mx, y: my },
    });
  }),
  on(GameActions.shapePlacement, (state) => {
    const board = entitiesManager.getEntity({
      state,
      entityId: GameObjectsIds.BOARD,
    });

    const includeComponents = [ComponentType.IS_ACTIVE_TAG];

    const activeShapes = componentsManager.getEntitiesWithComponents({
      state,
      includeComponents,
    });
    const activeShape = activeShapes.length > 0 ? activeShapes[0] : null;

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

    let newState = { ...state };

    // Проверяем наличие позиции для размещения и пересчитанных координат
    if (!placementPosition || !updatedShapeCoords) {
      // Удаляем компонент активной формы и добавляем компонент IS_PACK_TAG если фигуру нельзя поставить на поле
      newState = componentsManager.removeComponentFromEntity({
        state: newState,
        entityId: activeShape.id,
        componentType: ComponentType.IS_ACTIVE_TAG,
      });

      newState = componentsManager.addComponentToEntity({
        state: newState,
        entityId: activeShape.id,
        component: {
          type: ComponentType.IS_PACK_TAG,
        },
      });

      newState = componentsManager.removeComponentFromEntity({
        state: newState,
        entityId: activeShape.id,
        componentType: ComponentType.PLACEMENT,
      });

      newState = componentsManager.updateComponentData({
        state: newState,
        entityId: activeShape.id,
        componentType: ComponentType.ROTATE,
        changes: { angle: 0 },
      });

      return newState;
    }
    if (placementPosition && updatedShapeCoords) {
      // Получаем матрицу доски с учетом новой позиции формы
      const newBoard = boardGame.updateBoardMatrix(board, activeShape);

      if (newBoard) {
        // Обновляем матрицу доски
        newState = componentsManager.updateComponentData({
          state: newState,
          entityId: GameObjectsIds.BOARD,
          componentType: ComponentType.MATRIX,
          changes: { matrix: newBoard },
        });
      }

      // Удаляем компонент активной формы
      newState = componentsManager.removeComponentFromEntity({
        state: newState,
        entityId: activeShape.id,
        componentType: ComponentType.IS_ACTIVE_TAG,
      });

      // Добавляем компонент, что форма была размещена
      newState = componentsManager.addComponentToEntity({
        state: newState,
        entityId: activeShape.id,
        component: {
          type: ComponentType.PLACEMENT,
          cellX: placementPosition.cellX,
          cellY: placementPosition.cellY,
        },
      });

      // Обновляем позицию формы
      newState = componentsManager.updateComponentData({
        state: newState,
        entityId: activeShape.id,
        componentType: ComponentType.POSITION,
        changes: { x: updatedShapeCoords.x, y: updatedShapeCoords.y },
      });
      return newState;
    }

    return state;
  }),

  on(GameActions.ratioChanged, (state, { ratio }) => {
    const includedComponents: ComponentType[] = [ComponentType.RATIO];

    return componentsManager.updateComponentDataForEntities({
      state,
      includeComponents: includedComponents,
      componentType: ComponentType.RATIO,
      changes: { ratio },
    });
  }),
  on(GameActions.changeScene, (state, { changes }) => {
    const newState = componentsManager.updateComponentData({
      state,
      entityId: GameObjectsIds.BOARD,
      componentType: ComponentType.POSITION,
      changes,
    });

    const board = entitiesManager.getEntity({
      state: newState,
      entityId: GameObjectsIds.BOARD,
    });

    const placementShape = componentsManager.getEntitiesWithComponents({
      state: newState,
      includeComponents: [ComponentType.PLACEMENT],
    })[0];

    if (!board || !placementShape) {
      return newState;
    }

    const placementPosition = boardGame.recalculateShapePosition(
      board,
      placementShape
    );

    if (!placementPosition) {
      return newState;
    }

    return componentsManager.updateComponentData({
      state: newState,
      entityId: placementShape.id,
      componentType: ComponentType.POSITION,
      changes: { x: placementPosition.x, y: placementPosition.y },
    });
  })
);

/**
 * Finds the entity containing a point within its hint box component.
 * @param {EntityState<Entity>} entities - The state of the entities.
 * @param {number} pointX - The x-coordinate of the point.
 * @param {number} pointY - The y-coordinate of the point.
 * @returns {EntityId | null} The ID of the entity containing the point, or null if none found.
 */
function findEntityWithPoint(
  entities: EntityState<Entity>,
  { x: pointX, y: pointY }: { x: number; y: number }
): EntityId | null {
  for (const entityId of entities.ids) {
    const entity = entities.entities[entityId];
    if (
      !entity ||
      !entity.components.entities ||
      !entity.components.entities[ComponentType.HINT_BOX]
    ) {
      continue;
    }

    const hintBox = entity.components.entities[
      ComponentType.HINT_BOX
    ] as PickComponentType<ComponentType.HINT_BOX>;

    const isPointWithinBox =
      pointX >= hintBox.x &&
      pointX <= hintBox.x + hintBox.width &&
      pointY >= hintBox.y &&
      pointY <= hintBox.y + hintBox.height;

    if (isPointWithinBox) {
      return entity.id;
    }
  }

  return null;
}

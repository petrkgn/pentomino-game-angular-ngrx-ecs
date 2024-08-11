import { createReducer, on } from "@ngrx/store";

import { PickComponentType } from "../../types/components";
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
import ComponentsManager from "../../utils/componentsManager";
import EntitiesManager from "../../utils/entitiesManager";
import {
  findEntityWithPoint,
  handleBoardShapeSelection,
  handlePackShapeSelection,
  handleShapePlacementFailure,
  handleShapePlacementSuccess,
} from "../../utils/reducer-helpers";

const boardGame = new BoardGame();
const entitiesManager = new EntitiesManager(entitiesAdapter);
const componentsManager = new ComponentsManager(
  entitiesAdapter,
  componentsAdapter
);

export const gameReducer = createReducer(
  initialGameEntitiesState,
  on(PentominoActions.addEntity, (state, { entityId, components }) =>
    entitiesManager.createEntity({ state, entityId, components })
  ),
  on(PentominoActions.addComponentToEntity, (state, { entityId, component }) =>
    componentsManager.addComponentToEntity({ state, entityId, component })
  ),
  on(
    PentominoActions.updateComponentData,
    (state, { entityId, componentType, changes }) =>
      componentsManager.updateComponentData({
        state,
        entityId,
        componentType,
        changes,
      })
  ),
  on(PlayerActions.rotateShape, (state) => {
    const activeShape = componentsManager.getEntitiesWithComponents({
      state,
      includeComponents: [ComponentType.IS_ACTIVE_TAG],
    })[0];

    if (!activeShape) return state;

    const rotateComponent = activeShape.components.entities[
      ComponentType.ROTATE
    ] as PickComponentType<ComponentType.ROTATE>;

    let angle = rotateComponent.angle;
    const isMirror =
      activeShape.components.entities[ComponentType.IS_MIRROR_TAG];
    if (isMirror) {
      angle = (angle - 90 + 360) % 360;
    } else {
      angle = (angle + 90) % 360;
    }

    let newState = { ...state };

    const rotatedMatrix = utils.rotatePentomino(activeShape);
    const updatedComponents = [
      { componentType: ComponentType.ROTATE, changes: { angle } },
      { componentType: ComponentType.MATRIX, changes: rotatedMatrix },
    ];

    newState = componentsManager.updateMultipleComponentsDataForEntities(
      { state, includeComponents: [ComponentType.IS_ACTIVE_TAG] },
      updatedComponents
    );

    return newState;
  }),
  on(PlayerActions.mirrorShape, (state) => {
    const activeShape = componentsManager.getEntitiesWithComponents({
      state,
      includeComponents: [ComponentType.IS_ACTIVE_TAG],
    })[0];

    if (!activeShape) return state;

    const isMirror =
      activeShape.components.entities[ComponentType.IS_MIRROR_TAG];

    let newState = { ...state };
    if (isMirror) {
      newState = componentsManager.removeComponentFromEntity({
        state: newState,
        entityId: activeShape.id,
        componentType: ComponentType.IS_MIRROR_TAG,
      });
    } else {
      newState = componentsManager.addComponentToEntity({
        state: newState,
        entityId: activeShape.id,
        component: { type: ComponentType.IS_MIRROR_TAG },
      });
    }
    const mirroredMatrix = utils.mirrorPentomino(activeShape);

    newState = componentsManager.updateComponentData({
      state: newState,
      entityId: activeShape.id,
      componentType: ComponentType.MATRIX,
      changes: { matrix: mirroredMatrix.matrix },
    });

    return newState;
  }),
  on(PlayerActions.chooseShape, (state, { mx, my }) => {
    const board = entitiesManager.getEntity({
      state,
      entityId: GameObjectsIds.BOARD,
    });
    const shapesId = findEntityWithPoint(state, { x: mx, y: my });

    if (!shapesId && !board) return state;

    let newState = state;

    if (board) {
      const cellValue = boardGame.getCellValueAtMousePosition(mx, my, board);
      if (cellValue) {
        newState = handleBoardShapeSelection(
          newState,
          board,
          cellValue,
          mx,
          my
        );
      }
    }

    if (shapesId) {
      newState = handlePackShapeSelection(newState, shapesId, mx, my);
    }

    return newState;
  }),
  on(PlayerActions.mouseMove, (state, { mx, my }) =>
    componentsManager.updateComponentDataForEntities({
      state,
      includeComponents: [ComponentType.IS_ACTIVE_TAG],
      componentType: ComponentType.POSITION,
      changes: { x: mx, y: my },
    })
  ),
  on(GameActions.shapePlacement, (state) => {
    const board = entitiesManager.getEntity({
      state,
      entityId: GameObjectsIds.BOARD,
    });
    const activeShape = componentsManager.getEntitiesWithComponents({
      state,
      includeComponents: [ComponentType.IS_ACTIVE_TAG],
    })[0];
    if (!board || !activeShape) return { ...state };

    const placementPosition = boardGame.getPlacementPosition(
      board,
      activeShape
    );
    const updatedShapeCoords = boardGame.recalculateShapePosition(
      board,
      activeShape,
      placementPosition
    );

    if (!placementPosition || !updatedShapeCoords) {
      return handleShapePlacementFailure(state, activeShape);
    }

    return handleShapePlacementSuccess(
      state,
      board,
      activeShape,
      placementPosition,
      updatedShapeCoords
    );
  }),
  on(GameActions.ratioChanged, (state, { ratio }) =>
    componentsManager.updateComponentDataForEntities({
      state,
      includeComponents: [ComponentType.RATIO],
      componentType: ComponentType.RATIO,
      changes: { ratio },
    })
  ),
  on(GameActions.changeScene, (state, { changes }) => {
    let newState = componentsManager.updateComponentData({
      state,
      entityId: GameObjectsIds.BOARD,
      componentType: ComponentType.POSITION,
      changes,
    });

    const board = entitiesManager.getEntity({
      state: newState,
      entityId: GameObjectsIds.BOARD,
    });
    const placementShapes = componentsManager.getEntitiesWithComponents({
      state: newState,
      includeComponents: [ComponentType.PLACEMENT],
    });

    if (board && placementShapes.length > 0) {
      placementShapes.forEach((placementShape) => {
        const placementPosition = boardGame.recalculateShapePosition(
          board,
          placementShape
        );
        if (placementPosition) {
          newState = componentsManager.updateComponentData({
            state: newState,
            entityId: placementShape.id,
            componentType: ComponentType.POSITION,
            changes: { x: placementPosition.x, y: placementPosition.y },
          });
        }
      });
    }

    return newState;
  })
);

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
    const rotateComponent = activeShape.components.entities[
      ComponentType.ROTATE
    ] as PickComponentType<ComponentType.ROTATE>;

    if (!activeShape) return state;
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
    } else {
      return handleShapePlacementSuccess(
        state,
        board,
        activeShape,
        placementPosition,
        updatedShapeCoords
      );
    }

    // return handleShapePlacementSuccess(
    //   state,
    //   board,
    //   activeShape,
    //   placementPosition,
    //   updatedShapeCoords
    // );
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
    const placementShape = componentsManager.getEntitiesWithComponents({
      state: newState,
      includeComponents: [ComponentType.PLACEMENT],
    })[0];

    if (board && placementShape) {
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
    }

    return newState;
  })
);

function findEntityWithPoint(
  entities: EntityState<Entity>,
  { x: pointX, y: pointY }: { x: number; y: number }
): EntityId | null {
  for (const entityId of entities.ids) {
    const entity = entities.entities[entityId];
    if (entity?.components?.entities?.[ComponentType.HINT_BOX]) {
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
  }
  return null;
}

function handleBoardShapeSelection(
  state: EntityState<Entity>,
  board: Entity,
  cellValue: EntityId,
  mx: number,
  my: number
) {
  let newState = state;
  const newBoard = boardGame.clearShapeCellsOnBoard(board, cellValue);

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

  return newState;
}

function handlePackShapeSelection(
  state: EntityState<Entity>,
  shapesId: EntityId,
  mx: number,
  my: number
) {
  let newState = state;
  newState = componentsManager.removeComponentForEntities({
    state,
    includeComponents: [ComponentType.HINT_BOX],
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

  return newState;
}

function handleShapePlacementFailure(
  state: EntityState<Entity>,
  activeShape: Entity
) {
  const isMirror = activeShape.components.entities[ComponentType.IS_MIRROR_TAG];
  let newState = state;
  if (isMirror) {
    newState = componentsManager.removeComponentFromEntity({
      state: newState,
      entityId: activeShape.id,
      componentType: ComponentType.IS_MIRROR_TAG,
    });
  }
  newState = componentsManager.removeComponentFromEntity({
    state: newState,
    entityId: activeShape.id,
    componentType: ComponentType.IS_ACTIVE_TAG,
  });
  newState = componentsManager.addComponentToEntity({
    state: newState,
    entityId: activeShape.id,
    component: { type: ComponentType.IS_PACK_TAG },
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
  newState = componentsManager.updateComponentData({
    state: newState,
    entityId: activeShape.id,
    componentType: ComponentType.POSITION,
    changes: { x: 0, y: 0 },
  });
  newState = componentsManager.updateComponentData({
    state: newState,
    entityId: activeShape.id,
    componentType: ComponentType.MATRIX,
    changes: {
      matrix: [
        0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0,
        0,
      ],
    },
  });

  return newState;
}

function handleShapePlacementSuccess(
  state: EntityState<Entity>,
  board: Entity,
  activeShape: Entity,
  placementPosition: any,
  updatedShapeCoords: any
) {
  let newState = state;
  const newBoard = boardGame.updateBoardMatrix(board, activeShape);
  if (newBoard) {
    newState = componentsManager.updateComponentData({
      state: newState,
      entityId: GameObjectsIds.BOARD,
      componentType: ComponentType.MATRIX,
      changes: { matrix: newBoard },
    });
  }

  newState = componentsManager.removeComponentFromEntity({
    state: newState,
    entityId: activeShape.id,
    componentType: ComponentType.IS_ACTIVE_TAG,
  });
  newState = componentsManager.addComponentToEntity({
    state: newState,
    entityId: activeShape.id,
    component: {
      type: ComponentType.PLACEMENT,
      cellX: placementPosition.cellX,
      cellY: placementPosition.cellY,
    },
  });
  newState = componentsManager.updateComponentData({
    state: newState,
    entityId: activeShape.id,
    componentType: ComponentType.POSITION,
    changes: { x: updatedShapeCoords.x, y: updatedShapeCoords.y },
  });

  return newState;
}

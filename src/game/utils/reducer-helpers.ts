import { EntityState } from "@ngrx/entity";

import { Entity } from "../types/entity";
import { EntityId } from "../types/entity-id.type";
import { ComponentType } from "../constants/component-type.enum";
import { PickComponentType } from "../types/components";
import BoardGame from "./board";
import {
  componentsAdapter,
  entitiesAdapter,
} from "../store/game/initial.state";
import ComponentsManager from "./componentsManager";
import { GameObjectsIds } from "../constants/game-objects-ids.enum";
import { Matrices } from "../constants/matricies";
import { GameActions } from "../store/game/actions";

const boardGame = new BoardGame();
const componentsManager = new ComponentsManager(
  entitiesAdapter,
  componentsAdapter
);

export function findEntityWithPoint(
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

export function handleBoardShapeSelection(
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

export function handlePackShapeSelection(
  state: EntityState<Entity>,
  shapesId: EntityId,
  mx: number,
  my: number
) {
  let newState = state;
  newState = componentsManager.removeComponentFromEntity({
    state,
    entityId: shapesId,
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

export function handleShapePlacementFailure(
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
    componentType: ComponentType.MATRIX,
    changes: {
      matrix: Matrices[GameObjectsIds[activeShape.id] as keyof typeof Matrices],
    },
  });

  return newState;
}

export function handleShapePlacementSuccess(
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

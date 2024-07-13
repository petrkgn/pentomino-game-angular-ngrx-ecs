import { createActionGroup, props, emptyProps } from "@ngrx/store";

import { EntityComponents } from "../../types/components";
import { ComponentType } from "../../constants/component-type.enum";
import { Entity } from "../../types/entity";
import { EntityId } from "../../types/entity-id.type";
import { GameObjectsIds } from "../../constants/game-objects-ids.enum";

export const PentominoActions = createActionGroup({
  source: "Entity",
  events: {
    addEntity: props<{
      entityId: GameObjectsIds;
      components: EntityComponents[];
    }>(),
    updateEntity: props<{ id: EntityId; changes: Partial<Entity> }>(),
    deleteEntity: props<{ id: EntityId }>(),
    addComponentToEntity: props<{
      entityId: EntityId;
      component: EntityComponents;
    }>(),
    removeComponentFromEntity: props<{
      entityId: EntityId;
      currentComponentType: ComponentType;
    }>(),
    updateComponentData: props<{
      entityId: EntityId;
      componentType: ComponentType;
      changes: Partial<EntityComponents>;
    }>(),
  },
});

export const PlayerActions = createActionGroup({
  source: "Control",
  events: {
    mouseMove: props<{ mx: number; my: number }>(),
    rotateShape: props<{ angle: number }>(),
    chooseShape: props<{ mx: number; my: number }>(),
    empty: emptyProps(),
    mirrorShape: emptyProps(),
  },
});

export const GameActions = createActionGroup({
  source: "Game",
  events: {
    initRatio: emptyProps(),
    renderShape: props<{ ctx: CanvasRenderingContext2D }>(),
    changeScene: props<{ changes: Partial<EntityComponents> }>(),
    shapePlacement: emptyProps(),
    ratioChanged: props<{ ratio: number }>(),
  },
});

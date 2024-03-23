import { createActionGroup, props, emptyProps } from '@ngrx/store';

import { EntityComponents } from '../../interfaces/components';
import { ComponentType } from '../../constants/component-type.enum';
import { Entity } from '../../interfaces/entity';
import { EntityId } from '../../types/entity-id.type';

export const PentominoActions = createActionGroup({
  source: 'Entity',
  events: {
    addEntity: props<{ entity: Entity }>(),
    updateEntity: props<{ id: EntityId; changes: Partial<Entity> }>(),
    deleteEntity: props<{ id: EntityId }>(),
    addComponentToEntity:
      props<{ entityId: EntityId; component: EntityComponents }>(),
    removeComponentFromEntity:
      props<{ entityId: EntityId; currentComponent: ComponentType }>(),
    updateComponentData: props<{
      entityId: EntityId;
      currentComponent: ComponentType;
      changes: Partial<EntityComponents>;
    }>(),
  },
});

export const PlayerActions = createActionGroup({
  source: 'Control',
  events: {
    mouseMove: props<{ mx: number; my: number }>(),
    rotateShape: props<{ angle: number }>(),
  },
});

export const GameActions = createActionGroup({
  source: 'Game',
  events: {
    initRatio: emptyProps(),
    renderShape: props<{ ctx: CanvasRenderingContext2D }>(),
    createBoard: props<{ currentComponents: EntityComponents[] }>(),
    shapePlacement: emptyProps(),
    ratioChanged: props<{ ratio: number }>(),
  },
});

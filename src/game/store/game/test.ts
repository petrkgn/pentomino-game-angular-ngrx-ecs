import { createAction, createReducer, on, props } from "@ngrx/store";
import {
  componentsAdapter,
  entitiesAdapter,
  initialGameEntitiesState,
} from "./initial.state";
import EntitiesManager from "../../utils/entitiesManager";
import ComponentsManager from "../../utils/componentsManager";
import { ComponentType } from "../../constants/component-type.enum";
import { GameObjectsIds } from "../../constants/game-objects-ids.enum";
import { EntityId } from "../../types/entity-id.type";
import { EntityComponents } from "../../types/components";

const createEntities = createAction("[Pentomino] Create Entities");
const addComponentToEntity = createAction(
  "[Pentomino] Add Component to Entity",
  props<{ entityId: EntityId; component: EntityComponents }>()
);
const addComponentsToEntities = createAction(
  "[Pentomino] Add Components to Entities",
  props<{
    includeComponents: ComponentType[];
    excludeComponents: ComponentType[];
    component: EntityComponents;
  }>()
);
const updateComponentDataForEntities = createAction(
  "[Pentomino] Update Component Data for Entities",
  props<{
    includeComponents: ComponentType[];
    excludeComponents: ComponentType[];
    componentType: ComponentType;
    changes: Partial<EntityComponents>;
  }>()
);
const removeComponentsForEntities = createAction(
  "[Pentomino] Remove Components for Entities",
  props<{
    includeComponents: ComponentType[];
    excludeComponents: ComponentType[];
    componentType: ComponentType;
  }>()
);

// Создаем менеджеры для сущностей и компонентов
const entitiesManager = new EntitiesManager(entitiesAdapter);
const componentsManager = new ComponentsManager(
  entitiesAdapter,
  componentsAdapter
);

export const gameReducer = createReducer(
  initialGameEntitiesState,
  // Создаем несколько сущностей с разным набором компонентов
  on(createEntities, (state) => {
    state = entitiesManager.createEntity({
      state,
      entityId: GameObjectsIds.SHAPE_F,
      components: [
        { type: ComponentType.POSITION, x: 0, y: 0 },
        { type: ComponentType.SIZE, width: 10, height: 10 },
      ],
    });

    state = entitiesManager.createEntity({
      state,
      entityId: GameObjectsIds.SHAPE_W,
      components: [
        { type: ComponentType.POSITION, x: 5, y: 5 },
        { type: ComponentType.MATRIX, rows: 1, matrix: [1, 1, 1, 1] },
      ],
    });

    state = entitiesManager.createEntity({
      state,
      entityId: GameObjectsIds.BOARD,
      components: [
        { type: ComponentType.POSITION, x: 10, y: 10 },
        { type: ComponentType.SIZE, width: 20, height: 20 },
        { type: ComponentType.MATRIX, rows: 1, matrix: [1, 1, 1, 1] },
      ],
    });

    return state;
  }),

  // Добавляем компонент к одной из сущностей
  on(addComponentToEntity, (state, { entityId, component }) => {
    return componentsManager.addComponentToEntity({
      state,
      entityId,
      component,
    });
  }),

  // Находим сущности с определенными компонентами и добавляем им новый компонент
  on(
    addComponentsToEntities,
    (state, { includeComponents, excludeComponents, component }) => {
      return componentsManager.addComponentToEntities({
        state,
        includeComponents,
        excludeComponents,
        component,
      });
    }
  ),

  // Находим сущности с определенными компонентами и изменяем данные в определенном компоненте
  on(
    updateComponentDataForEntities,
    (
      state,
      { includeComponents, excludeComponents, componentType, changes }
    ) => {
      return componentsManager.updateComponentDataForEntities({
        state,
        includeComponents,
        excludeComponents,
        componentType,
        changes,
      });
    }
  ),

  // Удаляем компонент у определенных сущностей
  on(
    removeComponentsForEntities,
    (state, { includeComponents, excludeComponents, componentType }) => {
      return componentsManager.removeComponentForEntities({
        state,
        includeComponents,
        excludeComponents,
        componentType,
      });
    }
  )
);

// Пример использования действий в редукторе
const initialState = initialGameEntitiesState;

// Создание нескольких сущностей
let state = gameReducer(initialState, createEntities());

// Добавление компонента к одной из сущностей
state = gameReducer(
  state,
  addComponentToEntity({
    entityId: GameObjectsIds.SHAPE_F,
    component: { type: ComponentType.IS_PACK_TAG },
  })
);

// Находим сущности с компонентом POSITION и добавляем им компонент ACTIVE
state = gameReducer(
  state,
  addComponentsToEntities({
    includeComponents: [ComponentType.POSITION],
    excludeComponents: [],
    component: { type: ComponentType.IS_PACK_TAG },
  })
);

// Находим сущности с компонентом ACTIVE и обновляем их размеры
state = gameReducer(
  state,
  updateComponentDataForEntities({
    includeComponents: [ComponentType.IS_ACTIVE_TAG],
    excludeComponents: [],
    componentType: ComponentType.SIZE,
    changes: { width: 50, height: 50 },
  })
);

// Удаляем компонент COLOR у всех сущностей с компонентом ACTIVE
state = gameReducer(
  state,
  removeComponentsForEntities({
    includeComponents: [ComponentType.IS_ACTIVE_TAG],
    excludeComponents: [],
    componentType: ComponentType.IS_PACK_TAG,
  })
);

console.log(state);

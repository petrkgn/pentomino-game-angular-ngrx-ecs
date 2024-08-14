import { EntityAdapter } from "@ngrx/entity";
import { ComponentType } from "../constants/component-type.enum";
import { EntityComponents } from "../types/components";
import { GameObjects } from "../store/game/initial.state";
import { EntityId } from "../types/entity-id.type";
import { Entity } from "../types/entity";

/**
 * A common interface for input parameters of ComponentsManager methods.
 */
interface ComponentsManagerParams {
  state: GameObjects;
  entityId?: EntityId;
  component?: EntityComponents;
  componentType?: ComponentType;
  changes?: Partial<EntityComponents>;
  includeComponents?: ComponentType[];
  excludeComponents?: ComponentType[];
}

/**
 * Class to manage components of game entities.
 */
class ComponentsManager {
  private entitiesAdapter: EntityAdapter<Entity>;
  private componentsAdapter: EntityAdapter<EntityComponents>;

  /**
   * Creates an instance of ComponentsManager.
   * @param {EntityAdapter<Entity>} entitiesAdapter - The adapter for managing entities.
   * @param {EntityAdapter<EntityComponents>} componentsAdapter - The adapter for managing components.
   */
  constructor(
    entitiesAdapter: EntityAdapter<Entity>,
    componentsAdapter: EntityAdapter<EntityComponents>
  ) {
    this.entitiesAdapter = entitiesAdapter;
    this.componentsAdapter = componentsAdapter;
  }

  /**
   * Gets entities that contain specified components and optionally do not contain other specified components.
   * @param {ComponentsManagerParams} params - The parameters for the method.
   * @returns {Entity[]} An array of entities that match the criteria.
   */
  getEntitiesWithComponents(params: ComponentsManagerParams): Entity[] {
    const { state, includeComponents, excludeComponents = [] } = params;

    return Object.values(state.entities)
      .filter((entity): entity is Entity => entity !== undefined)
      .filter((entity) => {
        const componentTypes = entity.components.ids as ComponentType[];
        return (
          includeComponents?.every((type) => componentTypes.includes(type)) &&
          excludeComponents.every((type) => !componentTypes.includes(type))
        );
      });
  }

  /**
   * Adds a component to an entity.
   * @param {ComponentsManagerParams} params - The parameters for the method.
   * @returns {GameObjects} The new state of the game objects.
   */
  addComponentToEntity(params: ComponentsManagerParams): GameObjects {
    const { state, entityId, component } = params;
    if (entityId === undefined || !component) return state;
    const currentEntity = state.entities[entityId];

    if (!currentEntity) return state;

    const componentsState = currentEntity.components;

    return this.entitiesAdapter.updateOne(
      {
        id: entityId,
        changes: {
          components: this.componentsAdapter.addOne(component, componentsState),
        },
      },
      state
    );
  }

  /**
   * Adds a component to all entities in the state.
   * @param {ComponentsManagerParams} params - The parameters for the method.
   * @returns {GameObjects} The new state of the game objects.
   */
  addComponentToAllEntities(params: ComponentsManagerParams): GameObjects {
    const { state, component } = params;
    if (!component) return state;

    const allEntities = Object.values(state.entities);
    let newState = state;

    allEntities.forEach((entity) => {
      if (entity) {
        newState = this.addComponentToEntity({
          state: newState,
          entityId: entity.id,
          component,
        });
      }
    });

    return newState;
  }

  /**
   * Removes a component from an entity.
   * @param {ComponentsManagerParams} params - The parameters for the method.
   * @returns {GameObjects} The new state of the game objects.
   */
  removeComponentFromEntity(params: ComponentsManagerParams): GameObjects {
    const { state, entityId, componentType } = params;
    if (entityId === undefined || componentType === undefined) return state;
    const currentEntity = state.entities[entityId];

    if (!currentEntity) return state;

    const componentsState = currentEntity.components;

    return this.entitiesAdapter.updateOne(
      {
        id: entityId,
        changes: {
          components: this.componentsAdapter.removeOne(
            componentType,
            componentsState
          ),
        },
      },
      state
    );
  }

  /**
   * Removes a component from all entities in the state.
   * @param {ComponentsManagerParams} params - The parameters for the method.
   * @returns {GameObjects} The new state of the game objects.
   */
  removeComponentFromAllEntities(params: ComponentsManagerParams): GameObjects {
    const { state, componentType } = params;
    if (!componentType) return state;

    const allEntities = Object.values(state.entities);
    let newState = state;

    allEntities.forEach((entity) => {
      if (entity) {
        newState = this.removeComponentFromEntity({
          state: newState,
          entityId: entity.id,
          componentType,
        });
      }
    });

    return newState;
  }

  /**
   * Updates the data of a component in an entity.
   * @param {ComponentsManagerParams} params - The parameters for the method.
   * @returns {GameObjects} The new state of the game objects.
   */
  updateComponentData(params: ComponentsManagerParams): GameObjects {
    const { state, entityId, componentType, changes } = params;
    if (entityId === undefined || componentType === undefined || !changes)
      return state;

    const currentEntity = state.entities[entityId];

    if (!currentEntity) return state;

    const componentsState = currentEntity.components;

    return this.entitiesAdapter.updateOne(
      {
        id: entityId,
        changes: {
          components: this.componentsAdapter.updateOne(
            { id: componentType, changes },
            componentsState
          ),
        },
      },
      state
    );
  }

  /**
   * Updates the data of a component in all entities that contain specified components.
   * @param {ComponentsManagerParams} params - The parameters for the method.
   * @returns {GameObjects} The new state of the game objects.
   */
  updateComponentDataForEntities(params: ComponentsManagerParams): GameObjects {
    const {
      state,
      includeComponents,
      excludeComponents = [],
      componentType,
      changes,
    } = params;
    const entities = this.getEntitiesWithComponents({
      state,
      includeComponents,
      excludeComponents,
    });

    let newState = state;
    entities.forEach((entity) => {
      newState = this.updateComponentData({
        state: newState,
        entityId: entity.id,
        componentType,
        changes,
      });
    });

    return newState;
  }

  /**
   * Updates the data of multiple components in selected entities.
   * @param {ComponentsManagerParams} params - The parameters for the method.
   * @param {Array<{ componentType: ComponentType, changes: Partial<EntityComponents> }>} updates - An array of updates, each containing a component type and the changes to apply.
   * @returns {GameObjects} The new state of the game objects.
   */
  updateMultipleComponentsDataForEntities(
    params: ComponentsManagerParams,
    updates: Array<{
      componentType: ComponentType;
      changes: Partial<EntityComponents>;
    }>
  ): GameObjects {
    const { state, includeComponents, excludeComponents = [] } = params;
    const entities = this.getEntitiesWithComponents({
      state,
      includeComponents,
      excludeComponents,
    });

    let newState = state;
    entities.forEach((entity) => {
      updates.forEach(({ componentType, changes }) => {
        newState = this.updateComponentData({
          state: newState,
          entityId: entity.id,
          componentType,
          changes,
        });
      });
    });

    return newState;
  }

  /**
   * Removes a component from all entities that contain specified components.
   * @param {ComponentsManagerParams} params - The parameters for the method.
   * @returns {GameObjects} The new state of the game objects.
   */
  removeComponentForEntities(params: ComponentsManagerParams): GameObjects {
    const {
      state,
      includeComponents,
      excludeComponents = [],
      componentType,
    } = params;
    const entities = this.getEntitiesWithComponents({
      state,
      includeComponents,
      excludeComponents,
    });

    let newState = state;
    entities.forEach((entity) => {
      newState = this.removeComponentFromEntity({
        state: newState,
        entityId: entity.id,
        componentType,
      });
    });

    return newState;
  }

  /**
   * Adds a component to all entities that contain specified components.
   * @param {ComponentsManagerParams} params - The parameters for the method.
   * @returns {GameObjects} The new state of the game objects.
   */
  addComponentToEntities(params: ComponentsManagerParams): GameObjects {
    const {
      state,
      includeComponents,
      excludeComponents = [],
      component,
    } = params;
    const entities = this.getEntitiesWithComponents({
      state,
      includeComponents,
      excludeComponents,
    });

    let newState = state;
    entities.forEach((entity) => {
      newState = this.addComponentToEntity({
        state: newState,
        entityId: entity.id,
        component,
      });
    });

    return newState;
  }
}

export default ComponentsManager;

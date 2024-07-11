import { EntityAdapter } from "@ngrx/entity";
import { EntityId } from "../types/entity-id.type";
import { GameObjects } from "../store/game/initial.state";
import { Entity } from "../types/entity";
import { EntityComponents } from "../types/components";

/**
 * Общий интерфейс для входных данных методов EntitiesManager.
 */
interface EntitiesManagerParams {
  state: GameObjects;
  entityId?: EntityId;
  entity?: Entity;
  components?: EntityComponents[];
}

/**
 * Class to manage game entities.
 */
class EntitiesManager {
  private entitiesAdapter: EntityAdapter<Entity>;

  /**
   * Creates an instance of EntitiesManager.
   * @param {EntityAdapter<Entity>} entitiesAdapter - The adapter for managing entities.
   */
  constructor(entitiesAdapter: EntityAdapter<Entity>) {
    this.entitiesAdapter = entitiesAdapter;
  }

  /**
   * Creates an entity with specified components.
   * @param {EntitiesManagerParams} params - The parameters for the method.
   * @returns {GameObjects} The new state of the game objects.
   */
  createEntity(params: EntitiesManagerParams): GameObjects {
    const { state, entityId, components = [] } = params;
    if (!entityId) return state;

    const newEntity: Entity = {
      id: entityId,
      components: {
        ids: components.map((component) => component.type),
        entities: components.reduce((acc, component) => {
          acc[component.type] = component;
          return acc;
        }, {} as { [key: string]: EntityComponents }),
      },
    };

    return this.entitiesAdapter.addOne(newEntity, state);
  }

  /**
   * Deletes an entity.
   * @param {EntitiesManagerParams} params - The parameters for the method.
   * @returns {GameObjects} The new state of the game objects.
   */
  deleteEntity(params: EntitiesManagerParams): GameObjects {
    const { state, entityId } = params;
    if (!entityId) return state;

    return this.entitiesAdapter.removeOne(entityId, state);
  }

  /**
   * Gets an entity.
   * @param {EntitiesManagerParams} params - The parameters for the method.
   * @returns {Entity | undefined} The entity if found, otherwise undefined.
   */
  getEntity(params: EntitiesManagerParams): Entity | undefined {
    const { state, entityId } = params;
    if (!entityId) return undefined;

    return state.entities[entityId];
  }

  /**
   * Updates an entity with specified components.
   * @param {EntitiesManagerParams} params - The parameters for the method.
   * @returns {GameObjects} The new state of the game objects.
   */
  updateEntity(params: EntitiesManagerParams): GameObjects {
    const { state, entityId, entity } = params;
    if (!entityId || !entity) return state;

    return this.entitiesAdapter.updateOne(
      { id: entityId, changes: entity },
      state
    );
  }
}

export default EntitiesManager;

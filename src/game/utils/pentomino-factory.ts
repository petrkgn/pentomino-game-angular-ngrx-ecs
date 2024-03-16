import { EntityComponents } from '../interfaces/components';
import { ComponentType } from '../constants/component-type.enum';
import { Entity } from '../interfaces/entity';
import { EntityId } from '../types/entity-id.type';
import { GameObjectsIds } from '../constants/game-objects-ids.enum';

export function createEntity(
  id: EntityId,
  components: EntityComponents[]
): Entity {
  return {
    id,
    components,
  };
}

// ...

export function createEntitiesWithDifferentComponents(count: number): Entity[] {
  let entities: Entity[] = [];
  for (let i = 0; i < count; i++) {
    const positionX = i * 10; // Разные значения для каждой сущности
    const renderColor = i % 2 === 0 ? 'red' : 'blue'; // Разные цвета для четных и нечетных сущностей
    const entityId = GameObjectsIds.SHAPE_F;
    const entity = createEntity(entityId, [
      {
        type: ComponentType.POSITION,
        x: positionX,
        y: 0,
      },
      {
        type: ComponentType.RENDER,
        color: renderColor,
      },
    ]);

    entities.push(entity);
  }
  return entities;
}

// Создаем несколько сущностей с разными данными и отправляем их в хранилище
// const entityCount = 5;

// const entitiesWithDifferentComponents = createEntitiesWithDifferentComponents(entityCount);
// entitiesWithDifferentComponents.forEach(entity => store.dispatch(addEntity({ entity })));

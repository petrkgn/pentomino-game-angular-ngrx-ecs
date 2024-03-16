import { Dictionary } from '@ngrx/entity';
import { Entity } from '../interfaces/entity';

export function entitiesMapper(
  dictonaryEntities: Dictionary<Entity>
): Entity[] {
  const entitiesArray: Entity[] = [];
  Object.values(dictonaryEntities).map((entity) => {
    if (entity) entitiesArray.push(entity);
  });

  return entitiesArray;
}

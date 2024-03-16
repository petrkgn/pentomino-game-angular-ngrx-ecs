import { ComponentType } from "../constants/component-type.enum";
import { Entity } from "../interfaces/entity";

export function getEntitiesWithComponents(
  entities: Entity[],
  includedComponents: ComponentType[],
  excludedComponents: ComponentType[]
): Entity[] {
  const entitiesWithComponents: Entity[] = [];

  entities.forEach((entity) => {
    if (entity) {
      const hasIncludedComponents = includedComponents.every((included) =>
        entity.components.some((component) => component.type === included)
      );
      const hasExcludedComponents = excludedComponents.some((excluded) =>
        entity.components.some((component) => component.type === excluded)
      );

      if (
        hasIncludedComponents &&
        (!hasExcludedComponents || excludedComponents.length === 0)
      ) {
        entitiesWithComponents.push(entity);
      }
    }
  });
  return entitiesWithComponents;
}
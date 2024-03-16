import { Update } from '@ngrx/entity';
import { ComponentType } from '../constants/component-type.enum';
import { Entity } from '../interfaces/entity';
import { GameObjects } from '../store/game/initial.state';

export function updateEntitiesWithComponents(
  state: GameObjects,
  includedComponents: ComponentType[],
  excludedComponents: ComponentType[],
  currentComonentType: ComponentType,
  componentChanges: {}
): Update<Entity>[] {
  const updates: Update<Entity>[] = [];

  state.ids.forEach((id) => {
    const entity = state.entities[id];

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
        const currentComponentIndex = entity.components.findIndex(
          (component) => component.type === currentComonentType
        );

        if (currentComponentIndex !== -1) {
          const updatedMouseComponent = {
            ...entity.components[currentComponentIndex],
            ...componentChanges,
          };

          updates.push({
            id: id.toString(),
            changes: {
              components: [
                ...entity.components.slice(0, currentComponentIndex),
                updatedMouseComponent,
                ...entity.components.slice(currentComponentIndex + 1),
              ],
            },
          });
        }
      }
    }
  });
  return updates;
}

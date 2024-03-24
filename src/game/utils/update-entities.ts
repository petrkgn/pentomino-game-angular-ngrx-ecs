import { Update } from '@ngrx/entity';
import { ComponentType } from '../constants/component-type.enum';
import { Entity } from '../interfaces/entity';
import { GameObjects } from '../store/game/initial.state';
import { PickComponentType } from '../interfaces/components';

export function updateEntitiesWithComponents(
  state: GameObjects,
  includedComponents: ComponentType[],
  excludedComponents: ComponentType[],
  currentComponentType: ComponentType,
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
          (component) => component.type === currentComponentType
        );

        if (currentComponentIndex !== -1) {
          const updatedComponent = {
            ...entity.components[currentComponentIndex],
            ...componentChanges,
          };

          updates.push({
            id: id.toString(),
            changes: {
              components: [
                ...entity.components.slice(0, currentComponentIndex),
                updatedComponent,
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

export function updateActiveEntityWhenPlacement(
  activePentomino: Entity,
  currentPosition: PickComponentType<ComponentType.POSITION>
) {
  return activePentomino.components
    .filter((component) => component.type !== ComponentType.IS_ACTIVE_TAG)
    .map((component) =>
      component.type === ComponentType.POSITION
        ? { ...component, ...currentPosition }
        : component
    )
    .concat([{ type: ComponentType.IS_PLACEMENT_TAG }]);
}

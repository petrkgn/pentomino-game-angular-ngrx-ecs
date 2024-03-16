import { createSelector } from '@ngrx/store';

import { ComponentType } from '../../constants/component-type.enum';

import { GameFeature } from './game.reducer';

import { getEntitiesWithComponents } from '../../utils/filtered-entities';
import { entitiesMapper } from '../../utils/entities-mapper';

const { selectEntities } = GameFeature;

export const allEntities = selectEntities;

export const selectEntitiesWithFilteredComponents = (
  includedComponents: ComponentType[],
  excludedComponents: ComponentType[]
) =>
  createSelector(allEntities, (entities) => {
    let filteredEntities = entitiesMapper(entities);

    return getEntitiesWithComponents(
      filteredEntities,
      includedComponents,
      excludedComponents
    );
  });

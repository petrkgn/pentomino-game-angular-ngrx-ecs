import { createSelector } from '@ngrx/store';

import { ComponentType } from '../../constants/component-type.enum';
import { gameFeature } from './state';
// import { getEntitiesWithComponents } from '../../utils/filtered-entities';
import { entitiesMapper } from '../../utils/entities-mapper';
import { Entity } from '../../interfaces/entity';
import { Dictionary } from '@ngrx/entity';

const { selectEntities } = gameFeature;


// export const selectEntitiesWithFilteredComponents = (
//   includedComponents: ComponentType[],
//   excludedComponents: ComponentType[],
//   allEntities: Dictionary<Entity>
// ) =>
// {
//     const filteredEntities = entitiesMapper(allEntities);

//     return getEntitiesWithComponents(
//       filteredEntities,
//       includedComponents,
//       excludedComponents
//     );
//   };

//   export const selectActiveShape = 
//     createSelector(
//         selectEntities, 
//         (entities): Entity[] => {
//       const includedComponents = [ComponentType.IS_ACTIVE_TAG];
//       const excludedComponents: ComponentType[] = [];
//       const filteredEntities = entitiesMapper(entities);
  
//       return getEntitiesWithComponents(
//         filteredEntities,
//         includedComponents,
//         excludedComponents
//       );
//     });
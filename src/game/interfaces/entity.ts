import { EntityId } from '../types/entity-id.type';
import { EntityComponents } from './components';

export interface Entity {
  id: EntityId;
  components: EntityComponents[];
}

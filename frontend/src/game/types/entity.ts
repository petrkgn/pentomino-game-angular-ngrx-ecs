import { EntityState } from "@ngrx/entity";
import { EntityId } from "./entity-id.type";
import { EntityComponents } from "./components";

export type Entity = {
  id: EntityId;
  components: EntityState<EntityComponents>;
};

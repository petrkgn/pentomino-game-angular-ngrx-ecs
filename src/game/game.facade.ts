import { inject, Injectable, Signal } from "@angular/core";
import { Store } from "@ngrx/store";
import { map, Observable, tap } from "rxjs";

import { ComponentType } from "./constants/component-type.enum";
import { gameFeature } from "./store/game/state";
import { Entity } from "./types/entity";
import { areAllObjectsDefined, filterDefined } from "./utils";
import { EntityFactoryService } from "./services/entity-factory.service";
import { GameConfigService } from "./services/game-config.service";

@Injectable()
export class GameFacade {
  private readonly store = inject(Store);
  private readonly entityFactoryService = inject(EntityFactoryService);
  private readonly gameConfigService = inject(GameConfigService);

  selectActiveShape(): Observable<Entity[]> {
    return this.store
      .select(gameFeature.selectActiveShape)
      .pipe(map((entities) => this.handleEntitiesDefined(entities)));
  }

  selectPlacementShapes(): Observable<Entity[]> {
    return this.store
      .select(gameFeature.selectPlacementShapes)
      .pipe(map((entities) => this.handleEntitiesDefined(entities)));
  }

  selectShapesPack(): Observable<Entity[]> {
    return this.store
      .select(gameFeature.selectShapesPack)
      .pipe(map((entities) => this.handleEntitiesDefined(entities)));
  }

  selectBoard(): Observable<Entity> {
    return this.store
      .select(gameFeature.selectBoard)
      .pipe(map((entity) => this.handleEntitiesDefined([entity])?.[0]));
  }

  private handleEntitiesDefined(
    entities: (Entity | null | undefined)[]
  ): Entity[] {
    const isEntitiesDefined =
      entities.length > 0 && areAllObjectsDefined(entities);
    return isEntitiesDefined ? structuredClone(entities as Entity[]) : [];
  }

  initGameState(level: string) {
    this.gameConfigService
      .loadLevelConfig(level)
      .pipe(
        tap((config) => {
          this.entityFactoryService.setBoardSize(config.board.size);
          const boardConfig = {
            entityId: "BOARD",
            components: config.board.components.map(
              (component: string) =>
                ComponentType[component as keyof typeof ComponentType]
            ),
          };
          this.entityFactoryService.createEntity(boardConfig);

          config.shapes.forEach((shape) => {
            const shapeConfig = {
              entityId: shape.id,
              components: shape.components.map(
                (component) =>
                  ComponentType[component as keyof typeof ComponentType]
              ),
            };
            this.entityFactoryService.createEntity(shapeConfig);
          });
        })
      )
      .subscribe();
  }
}

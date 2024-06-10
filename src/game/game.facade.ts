import { inject, Injectable, Signal } from "@angular/core";
import { Store } from "@ngrx/store";

import { GameActions, PentominoActions } from "./store/game/actions";
import { ComponentType } from "./constants/component-type.enum";
import * as utils from "./utils/pentomino-factory";
import { BoardsSize } from "./constants/board-size";
import { GameObjectsIds } from "./constants/game-objects-ids.enum";

import { map, Observable } from "rxjs";
import { gameFeature } from "./store/game/state";
import { Entity } from "./interfaces/entity";
import { areAllObjectsDefined } from "./utils";

@Injectable()
export class GameFacade {
  private readonly store = inject(Store);
  private pentominoF = utils.createEntity(GameObjectsIds.SHAPE_F, [
    {
      type: ComponentType.POSITION,
      x: 0,
      y: 0,
    },
    {
      type: ComponentType.RATIO,
      ratio: 1,
    },
  ]);
  private pentominoW = utils.createEntity(GameObjectsIds.SHAPE_W, [
    {
      type: ComponentType.POSITION,
      x: 0,
      y: 0,
    },
    {
      type: ComponentType.MATRIX,
      rows: 3,
      matrix: [8, 0, 0, 8, 8, 0, 0, 8, 8],
    },
    {
      type: ComponentType.RATIO,
      ratio: 1,
    },
  ]);

  private gameBoard = utils.createEntity(GameObjectsIds.BOARD, [
    {
      type: ComponentType.POSITION,
      x: 0,
      y: 0,
    },
    {
      type: ComponentType.MATRIX,
      rows: 5,
      matrix: BoardsSize.firstLevel,
    },
    {
      type: ComponentType.RATIO,
      ratio: 1,
    },
  ]);

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

  private handleEntitiesDefined(entities: Entity[]): Entity[] {
    const isEntitiesDefined =
      entities.length > 0 && areAllObjectsDefined(entities);
    return isEntitiesDefined ? structuredClone(entities) : [];
  }

  initGameState(store: Store<any>) {
    store.dispatch(PentominoActions.addEntity({ entity: this.gameBoard }));
    store.dispatch(PentominoActions.addEntity({ entity: this.pentominoF }));
    store.dispatch(PentominoActions.addEntity({ entity: this.pentominoW }));
    store.dispatch(
      PentominoActions.addComponentToEntity({
        entityId: GameObjectsIds.SHAPE_W,
        component: {
          type: ComponentType.MOUSE,
          mx: 0,
          my: 0,
        },
      })
    );
    store.dispatch(
      PentominoActions.addComponentToEntity({
        entityId: GameObjectsIds.SHAPE_F,
        component: {
          type: ComponentType.MOUSE,
          mx: 0,
          my: 0,
        },
      })
    );

    store.dispatch(
      PentominoActions.addComponentToEntity({
        entityId: GameObjectsIds.SHAPE_W,
        component: { type: ComponentType.IS_ACTIVE_TAG },
      })
    );

    store.dispatch(
      PentominoActions.addComponentToEntity({
        entityId: GameObjectsIds.SHAPE_W,
        component: { type: ComponentType.ROTATE, angle: 0 },
      })
    );

    // this.mouseSystem.getEntitiesByMouseComponent();
    // this.mouseSystem.mouseMoved();
    setTimeout(
      () =>
        store.dispatch(
          PentominoActions.updateComponentData({
            entityId: GameObjectsIds.SHAPE_F,
            currentComponent: ComponentType.POSITION,
            changes: { x: 345 },
          })
        ),
      5000
    );
    store.dispatch(GameActions.initRatio());
  }
}

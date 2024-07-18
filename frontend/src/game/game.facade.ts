import { inject, Injectable, Signal } from "@angular/core";
import { Store } from "@ngrx/store";

import { GameActions, PentominoActions } from "./store/game/actions";
import { ComponentType } from "./constants/component-type.enum";
// import * as utils from "./utils/pentomino-factory";
import { BoardsSize } from "./constants/board-size";
import { GameObjectsIds } from "./constants/game-objects-ids.enum";

import { map, Observable } from "rxjs";
import { gameFeature } from "./store/game/state";
import { Entity } from "./types/entity";
import { areAllObjectsDefined } from "./utils";
import { EntityComponents } from "./types/components";
import { EntityView } from "./constants/view.enum";

@Injectable()
export class GameFacade {
  private readonly store = inject(Store);

  // private pentominoF = utils.createEntity(GameObjectsIds.SHAPE_F, [
  //   {
  //     type: ComponentType.POSITION,
  //     x: 0,
  //     y: 0,
  //   },
  //   {
  //     type: ComponentType.RATIO,
  //     ratio: 1,
  //   },
  // ]);

  private pentominoW = {
    entityId: GameObjectsIds.SHAPE_W,
    components: [
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
      {
        type: ComponentType.IS_PACK_TAG,
      },
      {
        type: ComponentType.HINT_BOX,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      {
        type: ComponentType.VIEW,
        img: EntityView.SHAPE_W,
      },
      {
        type: ComponentType.ROTATE,
        angle: 0,
      },
    ] as EntityComponents[],
  };

  private gameBoard = {
    entityId: GameObjectsIds.BOARD,
    components: [
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
    ] as EntityComponents[],
  };

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

  private handleEntitiesDefined(entities: Entity[]): Entity[] {
    const isEntitiesDefined =
      entities.length > 0 && areAllObjectsDefined(entities);
    return isEntitiesDefined ? structuredClone(entities) : [];
  }

  initGameState(store: Store<any>) {
    store.dispatch(
      PentominoActions.addEntity({
        entityId: this.gameBoard.entityId,
        components: this.gameBoard.components,
      })
    );
    // store.dispatch(PentominoActions.addEntity({ entity: this.pentominoF }));
    store.dispatch(
      PentominoActions.addEntity({
        entityId: this.pentominoW.entityId,
        components: this.pentominoW.components,
      })
    );
    //   store.dispatch(
    //     PentominoActions.addComponentToEntity({
    //       entityId: GameObjectsIds.SHAPE_W,
    //       component: {
    //         type: ComponentType.MOUSE,
    //         mx: 0,
    //         my: 0,
    //       },
    //     })
    //   );
    //   store.dispatch(
    //     PentominoActions.addComponentToEntity({
    //       entityId: GameObjectsIds.SHAPE_F,
    //       component: {
    //         type: ComponentType.MOUSE,
    //         mx: 0,
    //         my: 0,
    //       },
    //     })
    //   );

    //   store.dispatch(
    //     PentominoActions.addComponentToEntity({
    //       entityId: GameObjectsIds.SHAPE_W,
    //       component: { type: ComponentType.IS_PACK_TAG },
    //     })
    //   );

    //   store.dispatch(
    //     PentominoActions.addComponentToEntity({
    //       entityId: GameObjectsIds.SHAPE_W,
    //       component: { type: ComponentType.ROTATE, angle: 0 },
    //     })
    //   );

    //   store.dispatch(GameActions.initRatio());
  }
}

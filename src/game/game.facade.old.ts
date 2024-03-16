import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { GameActions, PentominoActions } from './store/game/game.actions';
import { ComponentType } from './constants/component-type.enum';
import * as utils from './utils/pentomino-factory';
import { BoardsSize } from './constants/board-size';
import { GameObjectsIds } from './constants/game-objects-ids.enum';
import { ResizeService } from './services/resize.service';
import { Observable } from 'rxjs';

@Injectable()
export class GameFacade {
  private readonly store = inject(Store);
  private readonly resizeService = inject(ResizeService);
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
      matrix: [
        [8, 0, 0],
        [8, 8, 0],
        [0, 8, 8],
      ],
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
      matrix: BoardsSize.firstLevel,
    },
    {
      type: ComponentType.RATIO,
      ratio: 1,
    },
  ]);

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
    store.dispatch(GameActions.initWindowSize({ name: 'test' }));
  }
}

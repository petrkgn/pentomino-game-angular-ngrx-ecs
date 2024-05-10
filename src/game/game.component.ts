import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';

import { ComponentType } from './constants/component-type.enum';
import { BackgroundComponent } from './layers/background/background.component';
import { ActiveShapeComponent } from './layers/active-shape/active-shape.component';
import { BoardComponent } from './layers/board/board.component';
import { GameFacade } from './game.facade';
// import * as gameSelectors from './store/game/selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { areAllObjectsDefined } from './utils/filter-defined';
import { filter, map } from 'rxjs';
import { Entity } from './interfaces/entity';
import { PlacementShapesComponent } from './layers/placement-shapes/placement-shapes.component';
import { GameActions } from './store/game/actions';

@Component({
  selector: 'katamino-game',
  imports: [
    BackgroundComponent,
    ActiveShapeComponent,
    PlacementShapesComponent,
    BoardComponent,
    JsonPipe,
    NgIf,
    AsyncPipe,
  ],
  standalone: true,
  providers: [GameFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <pre
      style="position:absolute; background-color: darkblue; opacity: 0.8; color: white; width: 200px; top: 50px"></pre>
    <game-board />
    <game-placement-shapes />
    <game-active-shape />`,
  styles: ``,
})
export class GameComponent implements OnInit {
  private readonly gameFacade = inject(GameFacade);
  private readonly store = inject(Store);

  // entities2$ = this.store
  //   .select(
  //     gameSelectors.selectEntitiesWithFilteredComponents(
  //       [ComponentType.PLACEMENT],
  //       []
  //     )
  //   )
  //   .pipe(
  //     map((entities) => {
  //       if (entities.length > 0 && areAllObjectsDefined(entities)) {
  //         return entities;
  //       } else {
  //         return [];
  //       }
  //     })
  //   );

  ngOnInit() {
    // this.store.dispatch(GameActions.initWindowSize());
    this.gameFacade.initGameState(this.store);
  }
}

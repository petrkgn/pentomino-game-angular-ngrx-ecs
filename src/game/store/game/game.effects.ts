import { Inject, inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { distinctUntilChanged, filter, map, Observable, tap } from 'rxjs';

import { GameActions, PlayerActions } from './game.actions';
import { KEY_PRESSED } from '../../tokens/key-pressed.token';
import { MOUSE_MOVE } from '../../tokens/mouse-event.token';
import { ResizeService } from '../../services/resize.service';

@Injectable()
export class GameEffects {
  private readonly actions$ = inject(Actions);
  private readonly keyPressed$ = inject(KEY_PRESSED);
  private readonly resizeService = inject(ResizeService);
  private readonly mouseMove$ = inject(MOUSE_MOVE);
  currentAngle = 0;

  readonly mouseEvent$ = createEffect(() =>
    this.mouseMove$.pipe(
      map((e) => PlayerActions.mouseMove({ mx: e.x, my: e.y }))
    )
  );

  readonly initRatio$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(GameActions.initRatio),
      map(() => {
        const ratio = this.resizeService.getRatio(32, 20);
        return GameActions.ratioChanged({ ratio: Math.ceil(ratio) });
      })
    );
  });

  readonly resizeWindow$ = createEffect(() => {
    return this.resizeService.calculateScaleRatio(20, 20).pipe(
      distinctUntilChanged(),
      map((e) => GameActions.ratioChanged({ ratio: Math.ceil(e) }))
    );
  });

  readonly keyEvent$ = createEffect(() =>
    this.keyPressed$.pipe(
      filter((e) => e === 'Space'),
      map((e) => {
        if (this.currentAngle >= 270) {
          this.currentAngle = 0;
        } else {
          this.currentAngle += 90;
        }

        return PlayerActions.keyDown({ angle: this.currentAngle });
      })
    )
  );

  readonly gameKeyEvent$ = createEffect(() =>
    this.keyPressed$.pipe(
      filter((e) => e === 'KeyK'),
      map((e) => {
        return GameActions.shapePlacement();
      })
    )
  );
}

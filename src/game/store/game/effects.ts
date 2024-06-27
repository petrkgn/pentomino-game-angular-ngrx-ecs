import { inject, Injectable } from "@angular/core";
import { Actions, createEffect } from '@ngrx/effects';
import { combineLatestWith, filter, map } from "rxjs";

import { GameActions, PlayerActions } from "./actions";


import { ResizeService } from "../../services/resize.service";
import { Store } from "@ngrx/store";
import { gameFeature } from "./state";
import { KEY_PRESSED } from "../../tokens/key-pressed.token";
import { MOUSE_EVENT } from "../../tokens/mouse-event.token";

@Injectable()
export class GameEffects {
  private readonly actions$ = inject(Actions);
  private readonly keyPressed$ = inject(KEY_PRESSED);
  private readonly resizeService = inject(ResizeService);
  private readonly mouseEvent$ = inject(MOUSE_EVENT);
  private readonly store = inject(Store);
  private readonly activeShapes$ = this.store.select(
    gameFeature.selectActiveShape
  );

  currentAngle = 0;

  readonly mouseMove$ = createEffect(() =>
    this.mouseEvent$.pipe(
      filter((e) => e.type === "mousemove"),
      map((e) => PlayerActions.mouseMove({ mx: e.x, my: e.y }))
    )
  );

  readonly mouseLeftButtonClick$ = createEffect(() =>
    this.mouseEvent$.pipe(
      combineLatestWith(this.activeShapes$),
      filter(
        ([e, s]) =>
          e.type === "mousedown" && e.button === 0 && !Boolean(s.length)
      ),
      map(([e, _s]) => PlayerActions.chooseShape({ mx: e.x, my: e.y }))
    )
  );

  readonly mouseRightButtonClick$ = createEffect(() =>
    this.mouseEvent$.pipe(
      filter((e) => e.type === "mousedown" && e.button === 2),
      map((e) => GameActions.shapePlacement())
    )
  );

  // readonly initRatio$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(GameActions.initRatio),
  //     map(() => {
  //       const ratio = this.resizeService.getRatio(32, 20);
  //       // return GameActions.ratioChanged({ ratio: Math.ceil(ratio) });
  //     })
  //   );
  // });

  readonly resizeWindow$ = createEffect(() => {
    return this.resizeService.calculateScaleRatio(32, 20).pipe(
      // distinctUntilChanged(),
      map((e) => GameActions.ratioChanged({ ratio: Math.ceil(e) }))
    );
  });

  readonly rotateShape$ = createEffect(() =>
    this.keyPressed$.pipe(
      filter((e) => e === "Space"),
      map((e) => {
        if (this.currentAngle >= 270) {
          this.currentAngle = 0;
        } else {
          this.currentAngle += 90;
        }

        return PlayerActions.rotateShape({ angle: this.currentAngle });
      })
    )
  );

  // readonly gameKeyEvent$ = createEffect(() =>
  //   this.keyPressed$.pipe(
  //     filter((e) => e === "KeyK"),
  //     map((e) => {
  //       return GameActions.shapePlacement();
  //     })
  //   )
  // );
}

import { inject, Injectable } from "@angular/core";
import { Actions, createEffect } from "@ngrx/effects";
import {
  debounceTime,
  filter,
  map,
  repeat,
  Subject,
  takeUntil,
  tap,
  withLatestFrom,
} from "rxjs";

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

  // Subjects to control the completion of click streams
  private stopClickWithoutActiveShape$$ = new Subject<void>();
  private stopClickWithActiveShape$$ = new Subject<void>();

  currentAngle = 0;

  // Effect to handle mouse move events
  readonly mouseMove$ = createEffect(() =>
    this.mouseEvent$.pipe(
      filter((e) => e.type === "mousemove"),
      map((e) => PlayerActions.mouseMove({ mx: e.x, my: e.y }))
    )
  );

  // Effect to handle clicks without an active shape
  readonly clickWithoutActiveShape$ = createEffect(() =>
    this.mouseEvent$.pipe(
      takeUntil(this.stopClickWithActiveShape$$), // Stop this effect when the other effect is triggered
      filter((e) => e.type === "mousedown" && e.button === 0),
      debounceTime(10), // Small delay to avoid double clicks
      withLatestFrom(this.activeShapes$),
      filter(([_, activeShapes]) => !activeShapes.length),
      tap(() => this.stopClickWithoutActiveShape$$.next()), // Trigger the stop signal for the other effect
      map(([e, _]) => PlayerActions.chooseShape({ mx: e.x, my: e.y })),
      repeat() // Ensure the stream continues after being stopped
    )
  );

  // Effect to handle clicks with an active shape
  readonly clickWithActiveShape$ = createEffect(() =>
    this.mouseEvent$.pipe(
      takeUntil(this.stopClickWithoutActiveShape$$), // Stop this effect when the other effect is triggered
      filter((e) => e.type === "mousedown" && e.button === 0), // Small delay to avoid double clicks
      withLatestFrom(this.activeShapes$),
      filter(([_, activeShapes]) => activeShapes.length > 0),
      tap(() => this.stopClickWithActiveShape$$.next()), // Trigger the stop signal for the other effect
      map(() => GameActions.shapePlacement()),
      repeat() // Ensure the stream continues after being stopped
    )
  );

  // Effect to handle window resize events
  readonly resizeWindow$ = createEffect(() =>
    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(map((e) => GameActions.ratioChanged({ ratio: Math.ceil(e) })))
  );

  // Effect to handle shape rotation
  readonly rotateShape$ = createEffect(() =>
    this.keyPressed$.pipe(
      filter((e) => e === "Space"),
      map(() => {
        if (this.currentAngle >= 270) {
          this.currentAngle = 0;
        } else {
          this.currentAngle += 90;
        }
        return PlayerActions.rotateShape({ angle: this.currentAngle });
      })
    )
  );
}

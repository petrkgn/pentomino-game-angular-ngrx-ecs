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

  readonly mouseMove$ = createEffect(() =>
    this.mouseEvent$.pipe(
      filter((e) => e.type === "mousemove"),
      map((e) => PlayerActions.mouseMove({ mx: e.x, my: e.y }))
    )
  );

  readonly clickWithoutActiveShape$ = createEffect(() =>
    this.mouseEvent$.pipe(
      filter((e) => e.type === "mousedown" && e.button === 0),
      debounceTime(50),
      withLatestFrom(this.activeShapes$),
      filter(([_, activeShapes]) => !activeShapes.length),
      tap(() => this.stopClickWithoutActiveShape$$.next()),
      map(([e, _]) => PlayerActions.chooseShape({ mx: e.x, my: e.y })),
      takeUntil(this.stopClickWithActiveShape$$),
      repeat()
    )
  );

  readonly clickWithActiveShape$ = createEffect(() =>
    this.mouseEvent$.pipe(
      filter((e) => e.type === "mousedown" && e.button === 0),
      debounceTime(50),
      withLatestFrom(this.activeShapes$),
      filter(([_, activeShapes]) => activeShapes.length > 0),
      tap(() => this.stopClickWithActiveShape$$.next()),
      map(() => GameActions.shapePlacement()),
      takeUntil(this.stopClickWithoutActiveShape$$),
      repeat()
    )
  );

  readonly clickForMirrorActiveShape$ = createEffect(() =>
    this.mouseEvent$.pipe(
      filter((e) => e.type === "mousedown" && e.button === 2),
      withLatestFrom(this.activeShapes$),
      filter(([_, activeShapes]) => activeShapes.length > 0),
      map(() => PlayerActions.mirrorShape())
    )
  );

  readonly resizeWindow$ = createEffect(() =>
    this.resizeService
      .calculateScaleRatio(32, 20)
      .pipe(map((e) => GameActions.ratioChanged({ ratio: Math.ceil(e) })))
  );

  readonly rotateShape$ = createEffect(() =>
    this.keyPressed$.pipe(
      filter((e) => e === "Space"),
      map(() => {
        return PlayerActions.rotateShape();
      })
    )
  );
}

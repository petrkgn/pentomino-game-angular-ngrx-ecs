import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import {
  debounceTime,
  delay,
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
import { GameStateService } from "../../services/game-state.service";
import { toSignal } from "@angular/core/rxjs-interop";

@Injectable()
export class GameEffects {
  private readonly actions$ = inject(Actions);
  private readonly keyPressed$ = inject(KEY_PRESSED);
  private readonly resizeService = inject(ResizeService);
  private readonly mouseEvent$ = inject(MOUSE_EVENT);
  private readonly store = inject(Store);
  private readonly gameStateService = inject(GameStateService);
  private readonly activeShapes$ = this.store.select(
    gameFeature.selectActiveShape
  );

  private stopClickWithoutActiveShape$$ = new Subject<void>();
  private stopClickWithActiveShape$$ = new Subject<void>();

  private readonly dpr = toSignal(this.resizeService.calculateDpr());

  readonly mouseMove$ = createEffect(() =>
    this.mouseEvent$.pipe(
      filter((e) => e.type === "mousemove"),
      map((e) => {
        const dpr = this.dpr() || 1;
        return PlayerActions.mouseMove({ mx: e.x * dpr, my: e.y * dpr });
      })
    )
  );

  readonly clickWithoutActiveShape$ = createEffect(() =>
    this.mouseEvent$.pipe(
      filter((e) => e.type === "mousedown" && e.button === 0),
      debounceTime(50),
      withLatestFrom(this.activeShapes$),
      filter(([_, activeShapes]) => !activeShapes.length),
      tap(() => this.stopClickWithoutActiveShape$$.next()),
      map(([e, _]) => {
        const dpr = this.dpr() || 1;
        return PlayerActions.chooseShape({ mx: e.x * dpr, my: e.y * dpr });
      }),
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

  readonly levelCompleted$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(GameActions.levelCompleted),
        delay(40),
        tap(() => this.gameStateService.completeLevel())
      );
    },
    { dispatch: false }
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

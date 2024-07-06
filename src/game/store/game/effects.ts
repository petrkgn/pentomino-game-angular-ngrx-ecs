import { inject, Injectable } from "@angular/core";
import { Actions, createEffect } from "@ngrx/effects";
import {
  combineLatestWith,
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
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
  private destroyClick1$$ = new Subject();
  private destroyClick2$$ = new Subject();
  currentAngle = 0;

  readonly mouseMove$ = createEffect(() =>
    this.mouseEvent$.pipe(
      filter((e) => e.type === "mousemove"),
      map((e) => PlayerActions.mouseMove({ mx: e.x, my: e.y }))
    )
  );
  readonly clickWithoutActiveShape$ = createEffect(() =>
    this.mouseEvent$.pipe(
      takeUntil(this.destroyClick2$$),
      filter((e) => e.type === "mousedown" && e.button === 0),
      debounceTime(10), // Добавим небольшую задержку
      withLatestFrom(this.activeShapes$),
      filter(([_, activeShapes]) => !activeShapes.length),
      tap(() => this.destroyClick1$$.next("")),
      map(([e, _]) => PlayerActions.chooseShape({ mx: e.x, my: e.y })),
      repeat()
    )
  );

  readonly clickWithActiveShape$ = createEffect(() =>
    this.mouseEvent$.pipe(
      takeUntil(this.destroyClick1$$),
      filter((e) => e.type === "mousedown" && e.button === 0), // Добавим небольшую задержку
      withLatestFrom(this.activeShapes$),
      filter(([_, activeShapes]) => activeShapes.length > 0),
      tap(() => this.destroyClick2$$.next("")),
      map(() => GameActions.shapePlacement()),
      repeat()
    )
  );

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
}

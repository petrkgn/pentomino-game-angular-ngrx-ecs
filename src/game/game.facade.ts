import { inject, Injectable, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import {
  catchError,
  distinctUntilChanged,
  map,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
  withLatestFrom,
} from "rxjs";
import { isEqual } from "lodash-es";

import { ComponentType } from "./constants/component-type.enum";
import { gameFeature } from "./store/game/state";
import { Entity } from "./types/entity";
import { EntityFactoryService } from "./services/entity-factory.service";
import { GameConfigService } from "./services/game-config.service";
import { GameActions, PentominoActions } from "./store/game/actions";
import { ResizeService } from "./services/resize.service";
import { Board, LevelConfig, Shape } from "./types/level-config";
import { areAllObjectsDefined } from "./utils/filter-defined";

@Injectable()
export class GameFacade implements OnDestroy {
  private readonly store = inject(Store);
  private readonly entityFactoryService = inject(EntityFactoryService);
  private readonly gameConfigService = inject(GameConfigService);
  private readonly resizeService = inject(ResizeService);
  private readonly destroy$ = new Subject<void>();
  private readonly startNextLevel$$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startNextLevel(): Observable<void> {
    return this.startNextLevel$$ as Observable<void>;
  }

  selectActiveShape(): Observable<Entity[]> {
    return this.store.select(gameFeature.selectActiveShape).pipe(
      map((entities) => this.handleEntitiesDefined(entities)),
      distinctUntilChanged((prev, curr) => isEqual(prev, curr))
    );
  }

  selectPlacementShapes(): Observable<Entity[]> {
    return this.store.select(gameFeature.selectPlacementShapes).pipe(
      map((entities) => this.handleEntitiesDefined(entities)),
      distinctUntilChanged((prev, curr) => isEqual(prev, curr))
    );
  }

  selectShapesPack(): Observable<Entity[]> {
    return this.store.select(gameFeature.selectShapesPack).pipe(
      map((entities) => this.handleEntitiesDefined(entities)),
      distinctUntilChanged((prev, curr) => isEqual(prev, curr))
    );
  }

  selectBoard(): Observable<Entity> {
    return this.store.select(gameFeature.selectBoard).pipe(
      map((entity) => this.handleEntitiesDefined([entity])?.[0]),
      distinctUntilChanged((prev, curr) => isEqual(prev, curr))
    );
  }

  selectAllShapes(): Observable<Entity[]> {
    return this.store
      .select(gameFeature.selectAll)
      .pipe(map((entities) => this.handleEntitiesDefined(entities)));
  }

  levelCompleted(): void {
    this.store.dispatch(GameActions.levelCompleted());
    this.saveNextLevelToLocalStorage(); // Перенос сохранения уровня сюда
    this.initGameState();
  }

  resetGame() {
    localStorage.removeItem("currentLevel");
    this.initGameState("level1");
  }

  initGameState(level?: string): void {
    const currentLevel = level || this.getCurrentLevelFromLocalStorage();

    this.gameConfigService
      .loadLevelConfig(currentLevel)
      .pipe(
        tap((config) => this.initializeGame(config)),
        tap(() => this.updateGameRatio()),
        tap(() => this.notifyNextLevelStarted()),
        catchError(() => this.handleInitGameStateError()),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private initializeGame(config: LevelConfig): void {
    if (!config) {
      throw new Error("Config not found");
    }

    this.store.dispatch(PentominoActions.removeAllEntities());
    this.setBoard(config.board);
    this.createShapes(config.shapes);
  }

  private setBoard(boardConfig: Board): void {
    this.entityFactoryService.setBoardSize(boardConfig.size);

    const boardEntityConfig = {
      entityId: "BOARD",
      components: boardConfig.components.map(
        (component: string) =>
          ComponentType[component as keyof typeof ComponentType]
      ),
    };

    this.entityFactoryService.createEntity(boardEntityConfig);
  }

  private createShapes(shapes: Shape[]): void {
    shapes.forEach((shape) => {
      const shapeConfig = {
        entityId: shape.id,
        components: shape.components.map(
          (component) => ComponentType[component as keyof typeof ComponentType]
        ),
      };
      this.entityFactoryService.createEntity(shapeConfig);
    });
  }

  private updateGameRatio(): void {
    const ratio = this.resizeService.getRatio(32, 20);
    this.store.dispatch(GameActions.ratioChanged({ ratio }));
  }

  private notifyNextLevelStarted(): void {
    this.startNextLevel$$.next();
  }

  private handleInitGameStateError(): Observable<null> {
    setTimeout(() => this.resetGame(), 0);
    return of(null);
  }

  private getCurrentLevelFromLocalStorage(): string {
    const level = localStorage.getItem("currentLevel");
    return level ? level : "level1";
  }

  private saveNextLevelToLocalStorage(): void {
    const currentLevel = this.getCurrentLevelFromLocalStorage();
    const levelNumber = parseInt(currentLevel.replace("level", ""), 10);
    const nextLevel = `level${levelNumber + 1}`;
    localStorage.setItem("currentLevel", nextLevel);
  }

  private handleEntitiesDefined(
    entities: (Entity | null | undefined)[]
  ): Entity[] {
    const isEntitiesDefined =
      entities.length > 0 && areAllObjectsDefined(entities);
    return isEntitiesDefined ? structuredClone(entities as Entity[]) : [];
  }
}

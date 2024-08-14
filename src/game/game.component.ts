import { Component, effect, inject, OnInit, untracked } from "@angular/core";

import { SceneComponent } from "./layers/scene/scene.component";
import { ActiveShapeComponent } from "./layers/active-shape/active-shape.component";
import { BoardComponent } from "./layers/board/board.component";
import { PlacementShapesComponent } from "./layers/placement-shapes/placement-shapes.component";
import { EffectsComponent } from "./layers/effects/effects.component";
import { GameFacade } from "./game.facade";
import { ShapesPackComponent } from "./layers/shapes-pack/shapes-pack.component";
import { AssetStore } from "./store/assets/asset-srore";
import { StartScreenComponent } from "./layers/start-screen/start-screen.component";
import { GameStateService } from "./services/game-state.service";
import { GameState } from "./constants/game.state.enum";
import { TutorialComponent } from "./layers/tutorial/tutorial.component";
import { LevelCompletedComponent } from "./layers/level-completed/level-completed.component";
import { CurtainComponent } from "./layers/curtain/curtain.component";

@Component({
  selector: "katamino-game",
  standalone: true,
  providers: [GameFacade],
  template: `
    <game-scene (fireCoords)="fireCoords = $event" />
    <game-board />
    @if(gameStateService.state() === gameState.PLAYING) {
    <game-effects [fireCoords]="fireCoords" />
    }
    <game-shapes-pack />
    <game-placement-shapes />
    <game-active-shape />
    @if(gameStateService.state() === gameState.LEVEL_COMPLETED) {
    <game-level-completed />
    } @if ( gameStateService.state() === gameState.TUTORIAL) {
    <game-curtain />
    } @if (gameStateService.state() === gameState.TUTORIAL) {
    <game-tutorial />
    } @if (gameStateService.state() === gameState.START) {
    <game-start-screen />
    }
  `,
  imports: [
    SceneComponent,
    ActiveShapeComponent,
    PlacementShapesComponent,
    BoardComponent,
    EffectsComponent,
    ShapesPackComponent,
    EffectsComponent,
    StartScreenComponent,
    TutorialComponent,
    LevelCompletedComponent,
    CurtainComponent,
  ],
})
export class GameComponent implements OnInit {
  private readonly gameFacade = inject(GameFacade);
  private readonly assetStore = inject(AssetStore);
  readonly gameStateService = inject(GameStateService);
  readonly gameState = GameState;

  fireCoords = { x1: 0, y1: 0, x2: 0, y2: 0 };
  private audio = new Audio("assets/Intro_011.mp3");

  constructor() {
    effect(() => {
      const gameState = this.gameStateService.state();
      untracked(() => {
        if (gameState !== this.gameState.START) {
          this.audio.play();
        } else {
          this.audio.pause();
          this.audio.currentTime = 0;
        }
      });
    });
  }

  ngOnInit() {
    this.assetStore.loadAssets();
    this.gameFacade.initGameState();
    this.audio.loop = true;
  }
}

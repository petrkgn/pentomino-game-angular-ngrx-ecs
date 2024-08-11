import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";

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

@Component({
  selector: "katamino-game",
  standalone: true,
  providers: [GameFacade],
  template: `
    <game-scene (fireCoords)="fireCoords = $event" />
    <game-board />
    @if (gameStateService.state === gameState.PLAYING) {
    <game-shapes-pack />
    <game-effects [fireCoords]="fireCoords" />
    <game-placement-shapes />
    <game-active-shape />
    } @if (gameStateService.state === gameState.TUTORIAL) {
    <game-tutorial />
    } @if (gameStateService.state === gameState.START) {
    <game-start-screen />
    }
  `,
  styles: ``,
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
  ],
})
export class GameComponent implements OnInit {
  private readonly gameFacade = inject(GameFacade);
  private readonly assetStore = inject(AssetStore);
  readonly gameStateService = inject(GameStateService);
  readonly gameState = GameState;

  fireCoords = { x1: 0, y1: 0, x2: 0, y2: 0 };
  GameState: any;

  ngOnInit() {
    this.assetStore.loadAssets();
    this.gameFacade.initGameState("level1");
  }
}

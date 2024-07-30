import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";

import { SceneComponent } from "./layers/scene/scene.component";
import { ActiveShapeComponent } from "./layers/active-shape/active-shape.component";
import { BoardComponent } from "./layers/board/board.component";
import { PlacementShapesComponent } from "./layers/placement-shapes/placement-shapes.component";
import { EffectsComponent } from "./layers/effects/effects.component";
import { GameFacade } from "./game.facade";
import { ShapesPackComponent } from "./layers/shapes-pack/shapes-pack";
import { AssetStore } from "./store/assets/asset-srore";
import { gameFeature } from "./store/game/state";

@Component({
  selector: "katamino-game",
  standalone: true,
  providers: [GameFacade],
  template: `
    <game-scene />
    <game-board />
    <game-placement-shapes />
    <game-shapes-pack />
    <game-active-shape />
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
  ],
})
export class GameComponent implements OnInit {
  private readonly gameFacade = inject(GameFacade);
  private readonly assetStore = inject(AssetStore);

  ngOnInit() {
    this.assetStore.loadAssets();
    this.gameFacade.initGameState("level1");
  }
}

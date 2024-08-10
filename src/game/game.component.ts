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

@Component({
  selector: "katamino-game",
  standalone: true,
  providers: [GameFacade],
  template: `
    <game-scene (fireCoords)="fireCoords = $event" />
    <game-board />
    <game-placement-shapes />
    <game-shapes-pack />
    <game-active-shape />
    <game-effects [fireCoords]="fireCoords" />
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

  fireCoords = { x1: 0, y1: 0, x2: 0, y2: 0 };

  ngOnInit() {
    this.assetStore.loadAssets();
    this.gameFacade.initGameState("level1");
  }
}

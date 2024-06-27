import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";

import { SceneComponent } from "./layers/scene/scene.component";
import { ActiveShapeComponent } from "./layers/active-shape/active-shape.component";
import { BoardComponent } from "./layers/board/board.component";
import { PlacementShapesComponent } from "./layers/placement-shapes/placement-shapes.component";
import { EffectsComponent } from "./layers/effects/effects.component";
import { GameFacade } from "./game.facade";

@Component({
  selector: "katamino-game",
  standalone: true,
  providers: [GameFacade],
  template: ` <game-scene />
    <game-board />
    <game-placement-shapes />
    <game-active-shape />
    <game-effects />`,
  styles: ``,
  imports: [
    SceneComponent,
    ActiveShapeComponent,
    PlacementShapesComponent,
    BoardComponent,
    EffectsComponent,
  ],
})
export class GameComponent implements OnInit {
  private readonly gameFacade = inject(GameFacade);
  private readonly store = inject(Store);

  ngOnInit() {
    this.gameFacade.initGameState(this.store);
  }
}

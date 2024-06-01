import {
  Component,
  provideExperimentalZonelessChangeDetection,
} from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
// import "zone.js";
import { provideState, provideStore } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import { GameComponent } from "./game/game.component";
// import { GameFeature } from './game/store/game/reducer';
import { GameEffects } from "./game/store/game/effects";
import { gameFeature } from "./game/store/game/state";

@Component({
  selector: "app-root",
  imports: [GameComponent],
  standalone: true,
  template: `
    <!-- <h1>Hello from {{ name }} game!</h1> -->
    <katamino-game />
  `,
})
export class App {
  name = "Anubis Gates";
}

bootstrapApplication(App, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideStore(),
    provideState(gameFeature),
    provideEffects([GameEffects]),
  ],
});

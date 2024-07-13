import {
  Component,
  isDevMode,
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
import { provideStoreDevtools } from "@ngrx/store-devtools";

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
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: !isDevMode(), // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
      trace: false, //  If set to true, will include stack trace for every dispatched action, so you can see it in trace tab jumping directly to that part of code
      traceLimit: 75, // maximum stack trace frames to be stored (in case trace option was provided as true)
    }),
  ],
});

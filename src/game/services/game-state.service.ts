import { Injectable, Signal, signal } from "@angular/core";
import { GameState } from "../constants/game.state.enum";

@Injectable({
  providedIn: "root",
})
export class GameStateService {
  state = signal<GameState>(GameState.START);

  //   get state(): GameState {
  //     return this._state();
  //   }

  setState(newState: GameState): void {
    this.state.set(newState);
  }

  startGame(): void {
    this.setState(GameState.START);
    this.loadAssets();
  }

  private loadAssets(): void {
    this.setState(GameState.TUTORIAL);
  }

  startTutorial(): void {
    this.setState(GameState.TUTORIAL);
  }

  startPlaying(): void {
    this.setState(GameState.PLAYING);
  }

  completeLevel(): void {
    this.setState(GameState.LEVEL_COMPLETED);
    // this.loadNextLevel();
  }

  //   private loadNextLevel(): void {
  //     this.setState(GameState.PLAYING);
  //   }

  failLevel(): void {
    this.setState(GameState.LEVEL_FAILED);
  }

  endGame(): void {
    this.setState(GameState.GAME_OVER);
  }
}

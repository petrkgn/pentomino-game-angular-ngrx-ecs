import { Injectable, Signal, signal } from "@angular/core";
import { GameState } from "../constants/game.state.enum";

@Injectable({
  providedIn: "root",
})
export class GameStateService {
  private _state = signal<GameState>(GameState.START);

  get state(): GameState {
    return this._state();
  }

  setState(newState: GameState): void {
    this._state.set(newState);
  }

  startGame(): void {
    this.setState(GameState.START);
    this.loadAssets();
  }

  private loadAssets(): void {
    // Логика загрузки изображений и звуков
    // После завершения загрузки, переключаемся на этап обучения
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
    this.loadNextLevel();
  }

  private loadNextLevel(): void {
    // Логика загрузки следующего уровня
    // После загрузки можно переключиться обратно на playing или другой статус
    this.setState(GameState.PLAYING);
  }

  failLevel(): void {
    this.setState(GameState.LEVEL_FAILED);
  }

  endGame(): void {
    this.setState(GameState.GAME_OVER);
  }
}

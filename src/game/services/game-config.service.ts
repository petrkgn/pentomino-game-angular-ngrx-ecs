import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { LevelConfig } from "../types/config";

@Injectable({
  providedIn: "root",
})
export class GameConfigService {
  private readonly http = inject(HttpClient);

  loadLevelConfig(level: string): Observable<LevelConfig> {
    return this.http.get<LevelConfig>(`assets/levels/${level}.json`);
  }
}

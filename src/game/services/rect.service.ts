import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class RectService {
  getTopLeftCoordinates(
    width: number,
    height: number,
    centerX: number,
    centerY: number
  ): {
    topLeftX: number;
    topLeftY: number;
  } {
    const topLeftX = centerX - width / 2;
    const topLeftY = centerY - height / 2;
    return { topLeftX, topLeftY };
  }
}

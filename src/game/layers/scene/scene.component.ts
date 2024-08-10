import {
  Component,
  ElementRef,
  effect,
  inject,
  output,
  signal,
  untracked,
  viewChild,
} from "@angular/core";

import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { CanvasParams } from "../../types/canvas-params";
import { Store } from "@ngrx/store";
import { PentominoActions } from "../../store/game/actions";
import { ComponentType } from "../../constants/component-type.enum";
import { RectService } from "../../services/rect.service";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { GameObjectsIds } from "../../constants/game-objects-ids.enum";

@Component({
  selector: "game-scene",
  imports: [CanvasParamsDirective],
  standalone: true,
  template: `
    <canvas
      canvasParams
      [context]="'2d'"
      (canvasParams)="canvasParams.set($event)"
      #canvas
    ></canvas>
    <img #bgImg src="/assets/fon.png" />
  `,
  styles: [
    `
      img {
        display: none;
      }
    `,
  ],
})
export class SceneComponent {
  private readonly bgImg =
    viewChild.required<ElementRef<HTMLImageElement>>("bgImg");

  private readonly rectService = inject(RectService);
  private readonly store = inject(Store);
  private readonly gameFacade = inject(GameFacade);

  fireCoords = output<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>();

  shapesPack = toSignal(this.gameFacade.selectAllShapes(), {
    initialValue: [],
  });

  canvasParams = signal<CanvasParams | null>(null);

  constructor() {
    effect(() => {
      const params = this.canvasParams();
      const bgImg = this.bgImg();
      if (params && bgImg) {
        untracked(() => {
          this.renderScene(params, bgImg.nativeElement);
        });
      }
    });
  }

  renderScene(
    canvasParams: CanvasParams | null,
    imgEl: HTMLImageElement
  ): void {
    if (!canvasParams) return;

    const { ctx, canvasCenter } = canvasParams;
    if (!(ctx instanceof CanvasRenderingContext2D)) return;

    const { topLeftX, topLeftY } = this.rectService.getTopLeftCoordinates(
      1280,
      896,
      canvasCenter!.x,
      canvasCenter!.y
    );

    ctx.drawImage(imgEl, topLeftX, topLeftY, 1280, 896);

    this.emitFireCoords(topLeftX, topLeftY);

    this.drawShapes(topLeftX, topLeftY);
  }

  private emitFireCoords(topLeftX: number, topLeftY: number): void {
    this.fireCoords.emit({
      x1: topLeftX - 32,
      y1: topLeftY + 32,
      x2: topLeftX + 73 * 16 - 2,
      y2: topLeftY + 32,
    });
  }

  private drawShapes(topLeftX: number, topLeftY: number): void {
    const shapesPack = this.shapesPack();
    const shapesCount = shapesPack.length;

    for (let i = 0; i <= 5; i++) {
      const offset = this.calculateShapeOffset(i);

      if (shapesPack[i]) {
        this.updateShape(shapesPack[i].id, topLeftX, topLeftY, offset);
      }

      if (shapesCount > 5 && i <= 5) {
        this.updateShape(
          shapesPack[i + 6]?.id,
          topLeftX + 62 * 16,
          topLeftY,
          offset
        );
      }
    }
  }

  private calculateShapeOffset(index: number): number {
    const diff = index * 16 * 6;
    const shift = 22 * index + (index * (index - 1)) / 2;
    return diff + shift + 10 * 16;
  }

  private updateShape(
    shapeId: GameObjectsIds,
    topLeftX: number,
    topLeftY: number,
    offset: number
  ): void {
    this.store.dispatch(
      PentominoActions.updateComponentData({
        entityId: shapeId,
        componentType: ComponentType.HINT_BOX,
        changes: {
          type: ComponentType.HINT_BOX,
          x: topLeftX + 6 * 16,
          y: topLeftY + offset,
          width: 6 * 16,
          height: 6 * 16,
        },
      })
    );
  }
}

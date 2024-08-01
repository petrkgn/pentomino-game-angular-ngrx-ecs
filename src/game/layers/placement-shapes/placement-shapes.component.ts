import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
  viewChild,
} from "@angular/core";

import { AsyncPipe, JsonPipe, NgIf } from "@angular/common";

import { Entity } from "../../types/entity";
import { GameFacade } from "../../game.facade";
import { toSignal } from "@angular/core/rxjs-interop";
import { CanvasParams } from "../../types/canvas-params";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";
import { RenderService } from "../../services/render-shapes.service";

@Component({
  selector: "game-placement-shapes",
  imports: [CanvasParamsDirective, JsonPipe, NgIf, AsyncPipe],
  standalone: true,
  template: ` <canvas
      canvasParams
      [canvasCss]="''"
      (canvasParams)="canvasParams.set($event)"
      #canvas
    ></canvas>
    <canvas #myCanvas sryle=""></canvas>`,
})
export class PlacementShapesComponent implements AfterViewInit {
  private readonly gameFacade = inject(GameFacade);
  private readonly renderService = inject(RenderService);

  placementShapes = toSignal(this.gameFacade.selectPlacementShapes(), {
    initialValue: [],
  });

  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>("myCanvas");

  canvasParams = signal<CanvasParams | null>(null);

  constructor() {
    effect((): void => {
      const placementShapes = this.placementShapes();
      const canvasParams = this.canvasParams();
      untracked(() => {
        if (!canvasParams) return;
        this.renderShapes(
          {
            width: window.innerWidth,
            height: window.innerHeight,
            canvas: this.canvas().nativeElement,
          },
          placementShapes
        );
      });
    });
  }

  ngAfterViewInit(): void {
    this.canvas().nativeElement.width = window.innerWidth;
    this.canvas().nativeElement.height = window.innerHeight;
  }

  renderShapes(canvasParams: CanvasParams, activeShapes: Entity[]): void {
    this.renderService.renderCurrentShapes(canvasParams, activeShapes);
  }
}

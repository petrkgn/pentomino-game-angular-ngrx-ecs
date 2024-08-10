import {
  Component,
  ElementRef,
  ViewChild,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from "@angular/core";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";

import { CanvasParams } from "../../types/canvas-params";
import { FireEffectService } from "../../services/fire-effect.service";

@Component({
  selector: "game-effects",
  imports: [CanvasParamsDirective],
  standalone: true,
  template: `<canvas
      #fire1
      style="width: 150px; height: 500px; top: 65px; left: 30px"
    ></canvas>
    <canvas
      #fire2
      style="width: 150px; height: 500px; top: 65px; left: 1225px"
    ></canvas>`,
  styles: ` `,
})
export class EffectsComponent {
  private fire1 = viewChild.required<ElementRef<HTMLCanvasElement>>("fire1");
  private fire2 = viewChild.required<ElementRef<HTMLCanvasElement>>("fire2");
  fireCoords = input({ x1: 0, y1: 0, x2: 0, y2: 0 });
  private readonly fireEffectService = inject(FireEffectService);

  constructor() {
    effect((): void => {
      const fireCoords = this.fireCoords();
      const fire1 = this.fire1().nativeElement;
      const fire2 = this.fire2().nativeElement;

      untracked(() => {
        fire1.style.top = `${fireCoords.y1 + 65}px`;
        fire1.style.left = `${fireCoords.x1}px`;
        fire2.style.top = `${fireCoords.y2 + 65}px`;
        fire2.style.left = `${fireCoords.x2}px`;
      });
    });
  }

  ngAfterViewInit(): void {
    this.fireEffectService.loadFragmentShader("/assets/fire.frag").then(() => {
      this.initCanvas(this.fire1().nativeElement);
      this.initCanvas(this.fire2().nativeElement);
    });
  }

  private initCanvas(canvas: HTMLCanvasElement): void {
    const offscreenCanvas = canvas.transferControlToOffscreen();
    offscreenCanvas.width = 150;
    offscreenCanvas.height = 500;
    this.fireEffectService.initWebGL(offscreenCanvas, { x: 65, y: 210 });
  }
}

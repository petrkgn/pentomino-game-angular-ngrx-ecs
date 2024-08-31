import {
  Component,
  ElementRef,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from "@angular/core";

import { FireEffectService } from "../../services/fire-effect.service";

@Component({
  selector: "game-effects",
  standalone: true,
  template: ` <canvas #fire1 style="position: absolute"></canvas>
    <canvas #fire2 style="position: absolute"></canvas>`,
  styles: ` `,
})
export class EffectsComponent {
  private fire1 = viewChild.required<ElementRef<HTMLCanvasElement>>("fire1");
  private fire2 = viewChild.required<ElementRef<HTMLCanvasElement>>("fire2");
  private readonly fireEffectService = inject(FireEffectService);

  fireCoords = input({ x1: 0, y1: 0, x2: 0, y2: 0 });

  constructor() {
    effect((): void => {
      const fireCoords = this.fireCoords();
      const fire1 = this.fire1().nativeElement;
      const fire2 = this.fire2().nativeElement;
      const dpr = window.devicePixelRatio || 1;

      untracked(() => {
        fire1.style.top = `${(fireCoords.y1 + 65) / dpr}px`;
        fire1.style.left = `${fireCoords.x1 / dpr}px`;
        fire2.style.top = `${(fireCoords.y2 + 65) / dpr}px`;
        fire2.style.left = `${fireCoords.x2 / dpr}px`;
        this.updateOffscreenCanvas(dpr);
      });
    });
  }

  ngAfterViewInit(): void {
    this.fireEffectService.loadFragmentShader("/assets/fire.frag").then(() => {
      this.initCanvas(this.fire1().nativeElement, "fire1");
      this.initCanvas(this.fire2().nativeElement, "fire2");
    });
  }

  private initCanvas(canvas: HTMLCanvasElement, canvasId: string): void {
    const dpr = window.devicePixelRatio || 1;

    const offscreenCanvas = canvas.transferControlToOffscreen();
    offscreenCanvas.width = 150 / dpr;
    offscreenCanvas.height = 500 / dpr;

    this.fireEffectService.initWebGL(canvasId, offscreenCanvas, {
      x: 65 / dpr,
      y: 210 / dpr,
    });
  }

  private updateOffscreenCanvas(dpr: number): void {
    const width = 150 / dpr;
    const height = 500 / dpr;

    this.fireEffectService.updateWebGLSize("fire1", width, height, {
      x: 65 / dpr,
      y: 210 / dpr,
    });

    this.fireEffectService.updateWebGLSize("fire2", width, height, {
      x: 65 / dpr,
      y: 210 / dpr,
    });
  }
}

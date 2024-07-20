import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  viewChild,
} from "@angular/core";
import { CanvasParamsDirective } from "../../directives/canvas-params.directive";

import { CanvasParams } from "../../types/canvas-params";
import { WebGLService } from "../../services/webgl.service";

@Component({
  selector: "game-effects",
  imports: [CanvasParamsDirective],
  standalone: true,
  template: `<canvas
      #fire1
      style="width: 150px; height: 500px; top: 50px; left: 30px"
    ></canvas>
    <canvas
      #fire2
      style="width: 150px; height: 500px; top: 50px; left: 1225px"
    ></canvas>`,
  styles: ` `,
})
export class EffectsComponent {
  @ViewChild("fire1") private fire1!: ElementRef<HTMLCanvasElement>;
  @ViewChild("fire2") private fire2!: ElementRef<HTMLCanvasElement>;

  private readonly webGLService = inject(WebGLService);

  ngAfterViewInit(): void {
    this.webGLService.loadFragmentShader("/assets/fire.frag").then(() => {
      this.webGLService.initWebGL(this.fire1.nativeElement);
      this.webGLService.initWebGL(this.fire2.nativeElement);
      this.setAnimationCoordinates(this.fire1.nativeElement, 65, 210); // example coordinates for canvas1
      this.setAnimationCoordinates(this.fire2.nativeElement, 65, 210); // example coordinates for canvas2
    });
  }

  setAnimationCoordinates(
    canvas: HTMLCanvasElement,
    x: number,
    y: number
  ): void {
    this.webGLService.setMouseCoordinates(canvas, x, y);
  }
}
